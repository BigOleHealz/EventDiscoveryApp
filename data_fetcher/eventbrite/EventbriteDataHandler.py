#! /usr/bin/python3.8
import os, json, traceback, sys
from uuid import uuid4
import pandas as pd

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from DataRecordHandler import DataRecordHandler
from utils.aws_handler import AWSHandler

from bs4 import BeautifulSoup

        
class EventbriteDataHandler(DataRecordHandler):
    def __init__(self, row: pd.Series, aws_handler: AWSHandler):
        self.event_data_script_type = "application/ld+json"
        row['city_code'] = row['city_code'].replace(" ", "-")
            
        super().__init__(row=row)

    def download_homepages(self):
        for page_no in range(1,4):
            output_file_key = os.path.join(self.homepage_prefix, f"homepage_{page_no}.html")
            url = self.row['source_url'].format(
                    state_code=self.row['state_code'],
                    city_code=self.city_code,
                    event_type_id=self.source_event_type_id,
                    page_no=page_no,
                    start_date=self.date,
                    end_date=self.date
                )
            try:
                self.driver.get(url)
                html_source = self.driver.page_source
                self.logger.info(f"Saving webpage content to S3")
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
            except Exception as e:
                self.logger.error(msg=f"Error fetching homepage for {url}")
                self.logger.error(msg=e)
                self.logger.error(msg=traceback.format_exc())
                raise e

    def parse_homepages(self, file_list: list):
        try:
            for filename in file_list:
                page_no = os.path.splitext(filename.split('/')[-1])[0].split("_")[1]
                output_key_prefix = os.path.join(self.eventpages_dir, self.date, self.city_code, self.source_event_type_id)
                
                self.logger.info(f"Parsing homepage for Page #: {page_no}")
                html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=filename)

                soup = BeautifulSoup(html_source, 'lxml')
                scripts = soup.find_all('script', attrs={'type': self.event_data_script_type})
                
                scripts = [script for script in scripts if script.get('url') is not None]
                

                if len(scripts) == 0:
                    self.update_ingestion_attempt(uuid=self.uuid, status="NO_EVENTS_FOUND")
                else:
                    for i, script in enumerate(scripts):
                        event_data_raw = json.loads(script.string)
                        
                        try:
                            url = event_data_raw['url']
                            source_event_id = url.split('-')[-1]
                            
                            output_file_key = os.path.join(output_key_prefix, source_event_id)

                            file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=output_file_key)
                            if file_exists_boolean:
                                self.logger.info(f"File {output_file_key} already exists in S3. Skipping...")
                                continue
                            
                            self.driver.get(url)
                            html_source = self.driver.page_source

                            self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
                        except Exception as e:
                            pass
        
        
        except Exception as e:
            self.logger.error(msg=f"Error parsing homepages")
            self.logger.error(msg=e)
            self.logger.error(msg=traceback.format_exc())
            raise e

    def parse_eventpages(self, file_list: list):
        for file_key in file_list:

            source_event_id = file_key.split('/')[-1]
            event_filename = f"{source_event_id}.json"
            full_file_key_success = os.path.join(self.event_data_json_success_prefix, event_filename)

            file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=full_file_key_success)
            if file_exists_boolean:
                self.logger.info(f"File {full_file_key_success} already exists in S3. Skipping...")
                continue

            html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=file_key)
            soup = BeautifulSoup(html_source, 'lxml')
            scripts = soup.find_all('script')

            event_uuid = str(uuid4())

            raw_event_data_dict = {
                "UUID": event_uuid,
                "source": self.row['source'],
                "source_id": self.row['source_id'],
                "event_url": source_event_id,
                "ingestion_uuid": self.uuid,
                'ingestion_status': "PENDING",
                "region_id": self.row['region_id'],
                "event_start_date": self.row['date'],
                "error_message": ""
            }

            output_file_key = ''
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
                            "UUID": event_uuid,
                            "StartTimestamp" : event_data_dict_raw["event"]["start"]["utc"].replace("Z", ""),
                            "EndTimestamp" : event_data_dict_raw["event"]["end"]["utc"].replace("Z", ""),
                            "EventName" : event_data_dict_raw["event"]["name"],
                            "Source" : self.row['source'],
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
                            "EventTypeUUID": self.row['target_event_type_uuid'],
                            "EventType": self.row['source_event_type_id'],
                            "S3Link": f"s3://{self.bucket_name}/{file_key}",
                            "EventType": self.row['target_event_type_string'],
                        }
                        
                        address_lower = event_data_dict['Address'].lower()
                        host_lower = event_data_dict['Host'].lower()
                        if "online" in address_lower or "virtual" in address_lower or "online" in host_lower or "virtual" in host_lower:
                            self.virtual_record_count += 1
                            output_file_key = os.path.join(self.event_data_json_online_prefix, event_filename)
                            raw_event_data_dict['ingestion_status'] = "VIRTUAL"
                        else:
                            self.success_record_count += 1
                            output_file_key = full_file_key_success
                        
                        self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=json.dumps(event_data_dict, indent=4))

            except json.decoder.JSONDecodeError as e:
                output_file_key = os.path.join(self.event_data_json_error_prefix, event_filename)
                error_start = max(0, e.pos - 5)
                error_end = min(len(script_text), e.pos + 6)
                error_context = script_text[error_start:error_end]

                error_data = {
                    "error_message": str(traceback.format_exc()),
                    "json_raw_text": script_text,
                    "filename": event_filename,
                    "error_context": error_context
                }
                raw_event_data_dict['ingestion_status'] = "ERROR"
                raw_event_data_dict['error_message'] = str(traceback.format_exc())

                self.error_record_count += 1
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=json.dumps(error_data, indent=4))

            except Exception as e:
                self.logger.error(traceback.format_exc())

                self.error_record_count += 1
                output_file_key = os.path.join(self.event_data_json_error_prefix, event_filename)
                raw_event_data_dict['ingestion_status'] = "ERROR"
                raw_event_data_dict['error_message'] = str(traceback.format_exc())
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=str(traceback.format_exc()))

            finally: 
                raw_event_data_dict['s3_link'] = f"s3://{self.bucket_name}/{output_file_key}"
                self.insert_raw_event(record=raw_event_data_dict)


if __name__ == "__main__":
    handler = EventbriteDataHandler()
    handler.run()
