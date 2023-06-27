#! /usr/bin/python3.8
import os, json, re, traceback, sys, shutil
from lxml import html

from dateutil import parser, tz
from dateutil.tz import tzoffset, tzlocal
from dateutil.parser import parse
from datetime import datetime, timedelta, timezone
from lxml import html
from pandas import date_range
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pytz
import openai

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.logger import Logger
from utils.constants import DATETIME_FORMAT

from bs4 import BeautifulSoup



class EventbriteDataHandler:
    def __init__(self):
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)
    
        # self.OPEN_AI_API_KEY = os.environ.get("OPEN_AI_API_KEY")
        self.tzinfos = {"EDT": tzoffset("EDT", -4 * 3600)}
        # if not self.OPEN_AI_API_KEY:
        #     raise Exception('OPEN_AI_API_KEY environment variable not set.')
        # else:
        #     openai.api_key = self.OPEN_AI_API_KEY
        self.logger = Logger(__name__)
        self.helper_functions = HelperFunctions(logger=self.logger)
        openai.api_key = self.helper_functions.get_open_ai_api_key()

        self.eventbrite_homepage_preformatted = "https://www.eventbrite.com/d/{state}--{city}/all-events/?page={page_no}&start_date={start_date}&end_date={end_date}"
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
        # response_json['EVENT_TYPE_NAME'] = response_json['EVENT_TYPE_NAME'][0].upper() + response_json['EVENT_TYPE_NAME'][1:]
        # response_json['EVENT_TYPE_NAME'] = response_json['EVENT_TYPE_NAME'].replace(" Event", "")
        # if response_json['EVENT_TYPE_NAME'] == "Event":
        #     response_json['EVENT_TYPE_NAME'] = "Generic"
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
                    print(f"Failed to delete {file_path}. Reason: {e}")
        else:
            os.makedirs(directory_path)
    
    def download_homepages(self, state: str, city: str, start_date: str, end_date: str):
        print("Downloading homepages")
        homepages_output_directory = os.path.join(self.eventbrite_homepages_dir, city, start_date)
        # self.__prepare_directory(homepages_output_directory)
        os.makedirs(os.path.dirname(homepages_output_directory), exist_ok=True)

        for page_no in [2]:
            try:
                url = self.eventbrite_homepage_preformatted.format(state=state, city=city, page_no=page_no, start_date=start_date, end_date=end_date)

                output_file_name = f"homepage_{page_no}.html"
                full_file_path = os.path.join(homepages_output_directory, output_file_name)

                self.driver.get(url)
                html_source = self.driver.page_source
                
                with open(full_file_path, 'w', encoding='utf-8') as f:
                    f.write(html_source)
                print(f"Downloaded homepage for page no: {page_no}")
            except Exception as e:
                print(f"Error Downloading Homepage {page_no}: {e}")
                print(traceback.format_exc())
                import pdb; pdb.set_trace()

    def parse_homepages(self, state: str, city: str): # , state: str, city: str, page_no: str, start_date: str, end_date: str
        print("Parsing homepages")
        for city in os.listdir(self.eventbrite_homepages_dir):
            print(f"Parsing homepages for city: {city}")
            full_path_city_dir = os.path.join(self.eventbrite_homepages_dir, city)
            for day in os.listdir(full_path_city_dir):
                print(f"Parsing homepages for day: {day}")
                day_dir = os.path.join(full_path_city_dir, day)
                output_full_path_city_date_dir = os.path.join(self.eventbrite_eventpages_dir, city, day)
                
                os.makedirs(os.path.dirname(output_full_path_city_date_dir), exist_ok=True)

                for filename in os.listdir(day_dir):
                    file_path = os.path.join(day_dir, filename)

                    page_no = os.path.splitext(filename)[0].split("_")[1]
                    print(f"Parsing homepage for \nCity: {city}\nDate: {day}\nPage #: {page_no}")
                
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


    def parse_eventpages(self, state: str, city: str, start_date: str, end_date: str):
        print(f"Parsing eventpages for {city} on {start_date}")

        full_path_event_data_json_dir = os.path.join(self.eventbrite_event_data_json_dir, city, start_date)
        os.makedirs(os.path.dirname(full_path_event_data_json_dir), exist_ok=True)

        full_path_location_date_dir = os.path.join(self.eventbrite_eventpages_dir, city, start_date)
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
                        # Check if script.string is not None before calling strip()
                        if script.string and script.string.strip().startswith('window.__SERVER_DATA__'):
                            script_text = script.string.strip().replace('window.__SERVER_DATA__ = ', '')
                            if script_text.endswith(';'):
                                script_text = script_text[:-1]
                            event_data_dict_raw = json.loads(script_text)

                            location_details = event_data_dict_raw["components"]["eventMap"]

                            event_description = ''
                            for module in event_data_dict_raw['components']['eventDescription']['structuredContent']['modules']:
                                if 'text' in module:
                                    event_description = module['text']
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
                                "Summary" : event_data_dict_raw['components']['eventDescription']['summary']
                            }

                            category_data_keys = ["EventName", "EventDescription", "Summary", "Host"]
                            category_data = {key: event_data_dict[key] for key in category_data_keys}
                            event_category_response = self.categorize_event(category_data, self.event_type_choices)
                            
                            event_type_name = event_category_response['EVENT_TYPE_NAME']
                            event_data_dict['EventType'] = event_type_name
                            event_data_dict['EventTypeUUID'] = self.event_type_choices_mappings_uuid_to_eventtype[event_type_name]
                            event_data_dict['ConfidenceLevel'] = event_category_response['CONFIDENCE_LEVEL']

                            if event_category_response['MATCHED']:

                                full_path_file_name = os.path.join(full_path_event_data_json_success_matched_dir, event_filename)
                            else:
                                full_path_file_name = os.path.join(full_path_event_data_json_success_unmatched_dir, event_filename)
                            
                            with open(full_path_file_name, 'w', encoding='utf-8') as f:
                                f.write(json.dumps(event_data_dict, indent=4))

                except Exception as e:
                    print(traceback.format_exc())
                    full_path_event_data_json_file = os.path.join(full_path_event_data_json_error_dir, event_filename)
                    with open(full_path_event_data_json_file, 'w', encoding='utf-8') as f:
                        f.write(html_source)


    def run(self):
        try:
            # homepages = os.listdir(self.eventbrite_homepages_dir)
            todays_date = datetime.now().strftime("%Y-%m-%d")
            state = "pa"
            city = "philadelphia"
            

            self.download_homepages(state=state, city=city, start_date=todays_date, end_date=todays_date)
            self.parse_homepages(state=state, city=city)
            self.parse_eventpages(state=state, city=city, start_date=todays_date, end_date=todays_date)
        except Exception as e:
            print(traceback.format_exc())

if __name__ == "__main__":
    handler = EventbriteDataHandler()
    # handler.fetch_homepages_in_date_range(start_date='2023-05-22', end_date='2023-05-24')
    handler.run()
