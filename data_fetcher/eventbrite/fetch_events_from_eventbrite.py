#! /usr/bin/python3.8
import os, json, traceback, sys, shutil

from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import openai

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.logger import Logger
from utils.constants import DATETIME_FORMAT

from bs4 import BeautifulSoup

location_dicts_list = [
    {"city": "boston", "state": "ma"},
    {"city": "philadelphia", "state": "pa"},
    {"city": "atlantic-city", "state": "nj"}
]

class EventbriteDataHandler:
    def __init__(self):
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)
    
        # self.tzinfos = {"EDT": tzoffset("EDT", -4 * 3600)}

        self.logger = Logger(__name__)
        self.helper_functions = HelperFunctions(logger=self.logger)
        openai.api_key = self.helper_functions.get_open_ai_api_key()

        self.eventbrite_homepage_preformatted = "https://www.eventbrite.com/d/{state}--{city}/all-events/?page={page_no}&start_date={date_str}&end_date={date_str}"
        self.event_data_script_type = "application/ld+json"


        self.logger = Logger(__name__)
        self.helper_functions = HelperFunctions(logger=self.logger)

        self.eventbrite_events_dir = os.getcwd()
        
        self.eventbrite_homepages_dir = os.path.join(
            self.eventbrite_events_dir, "homepages"
        )
        self.eventbrite_eventpages_dir = os.path.join(
            self.eventbrite_events_dir, "eventpages"
        )
        self.eventbrite_event_data_json_dir = os.path.join(
            self.eventbrite_events_dir, "event_data_json"
        )

        self.eventbrite_date_format = '%Y-%m-%dT%H:%M:%SZ'

        chrome_options = Options()
        chrome_options.add_argument("--headless")

        self.driver = webdriver.Chrome(options=chrome_options)

        self.event_type_mappings = self.neo4j.get_event_type_mappings()
        self.event_type_choices = [rec['EventType'] for rec in self.event_type_mappings]
        self.event_type_choices_mappings_uuid_to_eventtype = {rec['EventType']: rec['UUID'] for rec in self.event_type_mappings}
        
    
    def categorize_event(self, event_data: dict, choices: list):
        prompt = f'''respond to the following prompt with the format `{{"MATCHED": (true|false), "CONFIDENCE_LEVEL":<confidence_level>,
                    "EVENT_TYPE_NAME":"<EventType>"}}`: `categorize this event based on the following data {event_data}
                    from the following list of already-existing event types: {choices}. return the event type with the closest match.
                    also generate a confidence level
                    for your match that ranges between 0 and 1. if your confidence-level is 0.75 or higher, 
                    return your answer in the following format: {{"MATCHED": true, "CONFIDENCE_LEVEL":<confidence_level>,
                    "EVENT_TYPE_NAME":"<EventType>"}}. if the confidence-level is below 0.75, return your answer in the
                    following format: {{"MATCHED": false, "CONFIDENCE_LEVEL":<confidence_level>, "EVENT_TYPE_NAME":"<EventType>"}}.`'''

        response = openai.Completion.create(engine="text-davinci-002", prompt=prompt, temperature=0.5, max_tokens=100)

        response_text = response.choices[0].text.strip()
        response_json = json.loads(response_text)
        return response_json
    
    def __prepare_directory(self, directory_path):
        if os.path.exists(directory_path):
            # Delete all the files in the directory
            for filename in os.listdir(directory_path):
                file_path = os.path.join(directory_path, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    self.logger.error(f"Failed to delete {file_path}. Reason: {e}")
        else:
            os.makedirs(directory_path)
    
    def download_homepages(self, state: str, city: str, date_str: str):
        self.logger.info("Downloading homepages for {city} on {date_str} from eventbrite".format(city=city, date_str=date_str))
        homepages_output_directory = os.path.join(self.eventbrite_homepages_dir, city, date_str)
        os.makedirs(homepages_output_directory, exist_ok=True)

        for page_no in range(1,5):
            try:
                url = self.eventbrite_homepage_preformatted.format(state=state, city=city, page_no=page_no, date_str=date_str)

                output_file_name = f"homepage_{page_no}.html"
                full_file_path = os.path.join(homepages_output_directory, output_file_name)

                self.driver.get(url)
                html_source = self.driver.page_source
                
                with open(full_file_path, 'w', encoding='utf-8') as f:
                    f.write(html_source)
                self.logger.info(f"Downloaded homepage for page no: {page_no}")
            except Exception as e:
                self.logger.error(f"Error Downloading Homepage {page_no}: {e}")
                self.logger.error(traceback.format_exc())
                import pdb; pdb.set_trace()

    def parse_homepages(self, city: str, date_str: str):
        self.logger.info(f"Parsing homepages for\nCity: {city}\nDate: {date_str}")
        full_path_homepages__city_date_dir = os.path.join(self.eventbrite_homepages_dir, city, date_str)
        output_full_path_city_date_dir = os.path.join(self.eventbrite_eventpages_dir, city, date_str)
        
        os.makedirs(os.path.dirname(output_full_path_city_date_dir), exist_ok=True)

        for filename in os.listdir(full_path_homepages__city_date_dir):
            file_path = os.path.join(full_path_homepages__city_date_dir, filename)

            page_no = os.path.splitext(filename)[0].split("_")[1]
            self.logger.info(f"Parsing homepage for Page #: {page_no}")
        
            with open(file_path, 'r') as f:
                html_source = f.read()

            soup = BeautifulSoup(html_source, 'lxml')
            scripts = soup.find_all('script', attrs={'type': self.event_data_script_type})

            output_full_path_city_date_page_no_dir = os.path.join(output_full_path_city_date_dir, page_no)
            self.__prepare_directory(output_full_path_city_date_page_no_dir)

            for i, script in enumerate(scripts):
                event_data_raw = json.loads(script.string)
                
                url = event_data_raw['url']
                self.driver.get(url)
                html_source = self.driver.page_source

                output_file_name = f"event_{i}.html"
                full_file_path = os.path.join(output_full_path_city_date_page_no_dir, output_file_name)

                with open(full_file_path, 'w', encoding='utf-8') as f:
                    f.write(html_source)


    def parse_eventpages(self, city: str, date_str: str):
        self.logger.info(f"Parsing eventpages for {city} on {date_str}")

        full_path_event_data_json_dir = os.path.join(self.eventbrite_event_data_json_dir, city, date_str)
        os.makedirs(os.path.dirname(full_path_event_data_json_dir), exist_ok=True)

        full_path_location_date_dir = os.path.join(self.eventbrite_eventpages_dir, city, date_str)
        for page_no in os.listdir(full_path_location_date_dir):

            full_path_page_no_dir = os.path.join(full_path_location_date_dir, page_no)

            full_path_event_json_data_city_date_pageno = os.path.join(full_path_event_data_json_dir, page_no)
            full_path_event_data_json_error_dir = os.path.join(full_path_event_json_data_city_date_pageno, "error")
            full_path_event_data_json_success_dir = os.path.join(full_path_event_json_data_city_date_pageno, "success")
            full_path_event_data_json_success_matched_dir = os.path.join(full_path_event_data_json_success_dir, "matched")
            full_path_event_data_json_success_unmatched_dir = os.path.join(full_path_event_data_json_success_dir, "unmatched")
            
            os.makedirs(full_path_event_data_json_error_dir, exist_ok=True)
            os.makedirs(full_path_event_data_json_success_dir, exist_ok=True)
            os.makedirs(full_path_event_data_json_success_matched_dir, exist_ok=True)
            os.makedirs(full_path_event_data_json_success_unmatched_dir, exist_ok=True)

            for filename in os.listdir(full_path_page_no_dir):

                full_path_file = os.path.join(full_path_page_no_dir, filename)
                with open(full_path_file, 'r') as f:
                    html_source = f.read()
                soup = BeautifulSoup(html_source, 'lxml')

                scripts = soup.find_all('script')
                event_filename = f"{os.path.splitext(filename)[0]}.json"

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
                                "EventPageURL": event_page_url
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
                                full_path_file_name = os.path.join(full_path_event_data_json_success_matched_dir, event_filename)
                            else:
                                full_path_file_name = os.path.join(full_path_event_data_json_success_unmatched_dir, event_filename)
                            
                            with open(full_path_file_name, 'w', encoding='utf-8') as f:
                                f.write(json.dumps(event_data_dict, indent=4))

                except json.decoder.JSONDecodeError as e:
                    full_path_event_data_json_file = os.path.join(full_path_event_data_json_error_dir, event_filename)
                    error_start = max(0, e.pos - 5)
                    error_end = min(len(script_text), e.pos + 6)
                    error_context = script_text[error_start:error_end]

                    error_data = {
                        "error_message": str(traceback.format_exc()),
                        "json_raw_text": script_text,
                        "filename": event_filename,
                        "error_context": error_context
                    }
                    with open(full_path_event_data_json_file, 'w') as f:
                        f.write(json.dumps(error_data, indent=4))

                except Exception as e:
                    self.logger.error(traceback.format_exc())

                    full_path_event_data_json_file = os.path.join(full_path_event_data_json_error_dir, event_filename)
                    with open(full_path_event_data_json_file, 'w', encoding='utf-8') as f:
                        f.write(html_source)

    def run(self):

        date_list = [datetime.now().strftime("%Y-%m-%d")]
        # date_list = ["2023-06-28"]
        for location_dict in location_dicts_list:
            try:
                for date_str in date_list:
                    try:

                        self.download_homepages(state=location_dict["state"], city=location_dict["city"], date_str=date_str)
                        self.parse_homepages(city=location_dict["city"], date_str=date_str)
                        self.parse_eventpages(city=location_dict["city"], date_str=date_str)
                    except Exception as e:
                        self.logger.error(traceback.format_exc())
            except Exception as e:
                self.logger.error(traceback.format_exc())

if __name__ == "__main__":
    handler = EventbriteDataHandler()
    handler.run()
