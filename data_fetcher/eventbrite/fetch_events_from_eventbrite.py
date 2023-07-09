#! /usr/bin/python3.8
import os, json, traceback, sys

from datetime import datetime

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from data_fetcher.DataHandler import DataHandler
from utils.constants import DATETIME_FORMAT

from bs4 import BeautifulSoup

location_dicts_list = [
    {"city": "boston", "state": "ma"},
    {"city": "philadelphia", "state": "pa"},
    {"city": "atlantic-city", "state": "nj"}
]

class EventbriteDataHandler(DataHandler):
    def __init__(self):
        self.homepage_preformatted = "https://www.eventbrite.com/d/{state}--{city}/all-events/?page={page_no}&start_date={date_str}&end_date={date_str}"
        self.event_data_script_type = "application/ld+json"

        self.eventbrite_date_format = '%Y-%m-%dT%H:%M:%SZ'
        super().__init__(data_source="eventbrite")


    def parse_homepages(self, city: str, date_str: str):
        self.logger.info(f"Parsing homepages for\nCity: {city}\nDate: {date_str}")
        input_key_prefix = os.path.join(self.homepages_dir, date_str, city)
        file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=input_key_prefix)['Contents']]

        for filename in file_list:

            page_no = os.path.splitext(filename.split('/')[-1])[0].split("_")[1]
            output_key_prefix = os.path.join(self.eventpages_dir, date_str, city, page_no)
            
            self.logger.info(f"Parsing homepage for Page #: {page_no}")
            html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=filename)

            soup = BeautifulSoup(html_source, 'lxml')
            scripts = soup.find_all('script', attrs={'type': self.event_data_script_type})

            for i, script in enumerate(scripts):
                output_file_key = os.path.join(output_key_prefix, f"event_{i}.html")

                file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=output_file_key)
                if file_exists_boolean:
                    self.logger.info(f"File {output_file_key} already exists in S3. Skipping...")
                    continue
                
                event_data_raw = json.loads(script.string)
                url = event_data_raw['url']
                self.driver.get(url)
                html_source = self.driver.page_source

                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)

    def parse_eventpages(self, city: str, date_str: str):
        self.logger.info(f"Parsing eventpages for\nCity: {city}\nDate: {date_str}")

        eventpages_date_city_prefix = os.path.join(self.eventpages_dir, date_str, city)
        event_data_json_prefix = os.path.join(self.event_data_json_dir, date_str, city)

        file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=eventpages_date_city_prefix)['Contents']]

        for file_key in file_list:
            page_no = file_key.split('/')[-2]

            event_json_data_page_no_prefix = os.path.join(event_data_json_prefix, page_no)
            event_data_json_error_prefix = os.path.join(event_json_data_page_no_prefix, "error")
            event_data_json_success_prefix = os.path.join(event_json_data_page_no_prefix, "success")
            event_data_json_success_matched_prefix = os.path.join(event_data_json_success_prefix, "matched")
            event_data_json_success_unmatched_prefix = os.path.join(event_data_json_success_prefix, "unmatched")

            event_filename = f"{os.path.splitext(file_key.split('/')[-1])[0]}.json"
            full_file_key_matched = os.path.join(event_data_json_success_matched_prefix, event_filename)

            file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=full_file_key_matched)
            if file_exists_boolean:
                self.logger.info(f"File {full_file_key_matched} already exists in S3. Skipping...")
                continue

            html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=file_key)
            soup = BeautifulSoup(html_source, 'lxml')
            scripts = soup.find_all('script')

            try:
                for script in scripts:
                    if script.string and script.string.strip().startswith('window.__SERVER_DATA__'):
                        script_text = script.string.strip().replace('window.__SERVER_DATA__ = ', '')
                        if script_text.endswith(';'):
                            script_text = script_text[:-1]
                        event_data_dict_raw = json.loads(script_text)

                        location_details = event_data_dict_raw["components"]["eventMap"]
                        structured_content = event_data_dict_raw["components"]["eventDescription"]["structuredContent"]

                        event_description = ''
                        for module in structured_content['modules']:
                            if 'text' in module:
                                event_description = module['text']
                                break
                        
                        event_page_url = ''
                        for module in structured_content['modules']:
                            if 'url' in module:
                                event_page_url = module['url']
                                break
                        
                        image_url = ''
                        for widget in structured_content['widgets']:
                            for slide in widget['data']['slides']:
                                image_dict = slide['image']
                                if 'url' in image_dict:
                                    image_url = image_dict['url']
                                    break
                            if image_url != '':
                                break
                        
                        price = event_data_dict_raw['components']['conversionBar']['panelDisplayPrice']
                        free_event_flag = True if price == 'Free' else False

                        event_data_dict = {
                            "StartTimestamp" : event_data_dict_raw["event"]["start"]["utc"].replace("Z", ""),
                            "EndTimestamp" : event_data_dict_raw["event"]["end"]["utc"].replace("Z", ""),
                            "EventName" : event_data_dict_raw["event"]["name"],
                            "Source" : "eventbrite",
                            "SourceEventID": int(event_data_dict_raw["event"]["id"]),
                            "EventURL": event_data_dict_raw["event"]["url"],
                            "Lon" : location_details["location"]["longitude"],
                            "Lat" : location_details["location"]["latitude"],
                            "Address" : location_details["venueAddress"],
                            "Host" : location_details["venueName"],
                            "PublicEventFlag" : True,
                            "EventDescription" : event_description,
                            "Summary" : event_data_dict_raw['components']['eventDescription']['summary'],
                            "ImageURL": image_url,
                            "EventPageURL": event_page_url,
                            "Price": price,
                            "FreeEventFlag": free_event_flag,
                        }

                        category_data_keys = ["EventName", "EventDescription", "Summary", "Host"]
                        category_data = {key: event_data_dict[key] for key in category_data_keys}
                        event_category_response = self.categorize_event(category_data, self.event_type_choices)
                        
                        event_type_name = event_category_response['EVENT_TYPE_NAME']
                        event_data_dict['EventType'] = event_type_name
                        event_type_uuid = self.event_type_choices_mappings_uuid_to_eventtype.get(event_type_name)
                        if event_type_uuid is None:
                            continue
                        event_data_dict['EventTypeUUID'] = event_type_uuid
                        event_data_dict['ConfidenceLevel'] = event_category_response['CONFIDENCE_LEVEL']

                        if event_category_response['MATCHED']:
                            full_path_file_name = full_file_key_matched
                        else:
                            full_path_file_name = os.path.join(event_data_json_success_unmatched_prefix, event_filename)
                        
                        self.aws_handler.write_to_s3(bucket=self.bucket_name, key=full_path_file_name, data=json.dumps(event_data_dict, indent=4))

            except json.decoder.JSONDecodeError as e:
                full_path_event_data_json_file = os.path.join(event_data_json_error_prefix, event_filename)
                error_start = max(0, e.pos - 5)
                error_end = min(len(script_text), e.pos + 6)
                error_context = script_text[error_start:error_end]

                error_data = {
                    "error_message": str(traceback.format_exc()),
                    "json_raw_text": script_text,
                    "filename": event_filename,
                    "error_context": error_context
                }
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=full_path_event_data_json_file, data=json.dumps(error_data, indent=4))

            except Exception as e:
                self.logger.error(traceback.format_exc())

                full_path_event_data_json_file = os.path.join(event_data_json_error_prefix, event_filename)
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=full_path_event_data_json_file, data=str(traceback.format_exc(), indent=4))



    def run(self):
        date_list = [datetime.now().strftime("%Y-%m-%d")]
        # date_list = ['2023-07-11']
        # for i in range(0, 8):
        #     date_list.append((datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d"))
        for date_str in date_list:
            try:
                for location_dict in location_dicts_list:
                    try:
                        self.download_homepages(state=location_dict["state"], city=location_dict["city"], date_str=date_str)
                    except Exception as e:
                        self.logger.error(traceback.format_exc())
                for location_dict in location_dicts_list:
                    try:
                        self.parse_homepages(city=location_dict["city"], date_str=date_str)
                    except Exception as e:
                        self.logger.error(traceback.format_exc())
                for location_dict in location_dicts_list:
                    try:
                        self.parse_eventpages(city=location_dict["city"], date_str=date_str)
                    except Exception as e:
                        self.logger.error(traceback.format_exc())
                for location_dict in location_dicts_list:
                    try:
                        self.load_events_to_neo4j(city=location_dict["city"], date_str=date_str)
                    except Exception as e:
                        self.logger.error(traceback.format_exc())
            except Exception as e:
                self.logger.error(traceback.format_exc())

if __name__ == "__main__":
    handler = EventbriteDataHandler()
    handler.run()
