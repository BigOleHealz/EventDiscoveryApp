#! /usr/bin/python3.8
import os, json, re, traceback, sys, shutil
from lxml import html

from dateutil import parser, tz
from dateutil.tz import tzoffset
from dateutil.parser import parse
from datetime import datetime, timedelta
from lxml import html
from pandas import date_range
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

import openai


current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.constants import facebook_location_ids

class FacebookEventDataHandler:
    def __init__(self):
        self.OPEN_AI_API_KEY = os.environ.get('OPEN_AI_API_KEY')
        self.tzinfos = {
            "EDT": tzoffset("EDT", -4 * 3600)
        }
        if not self.OPEN_AI_API_KEY:
            raise Exception('OPEN_AI_API_KEY environment variable not set.')
        else:
            openai.api_key = self.OPEN_AI_API_KEY
        
        self.__facebook_events_homepage_url = 'https://www.facebook.com/events/?date_filter_option=CUSTOM_DATE_RANGE&discover_tab=CUSTOM&end_date={event_date}T04%3A00%3A00.000Z&location_id={location_id}&start_date={event_date}T04%3A00%3A00.000Z'
        
        self.logger = Logger(__name__)
        self.helper_functions = HelperFunctions(logger=self.logger)

        self.__facebook_events_dir = os.path.join(os.environ['STONKS_APP_HOME'], 'Testing', 'data', 'facebook_events')
        self.__facebook_homepages_dir = os.path.join(self.__facebook_events_dir, 'homepages')
        self.__facebook_eventpages_dir = os.path.join(self.__facebook_events_dir, 'eventpages')
        self.__facebook_event_data_json_dir = os.path.join(self.__facebook_events_dir, 'event_data_json')

        chrome_options = Options()
        chrome_options.add_argument("--headless")

        self.driver = webdriver.Chrome(options=chrome_options)

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
                    print(f'Failed to delete {file_path}. Reason: {e}')
        else:
            # Create the directory
            os.makedirs(directory_path)

    def __get_event_description(self, text):
        
        match = re.search(r'"event_description":\{"text":"(.*?)"', text)

        if match:
            event_description = match.group(1)  # group(1) refers to the contents of the first (and in this case, only) set of parentheses in the regex
            return event_description
        else:
            print('No "event_description" found in the HTML document text.')
            return ''

    def __find_bbox_value(self, s):
        match = re.search(r'"__bbox":({.*})', s)
        if match:
            # substring starting from "__bbox":
            substring = match.group(1)
            
            # Find the end of the JSON by counting opening and closing braces
            braces_count = 0
            for i, char in enumerate(substring):
                if char == '{':
                    braces_count += 1
                elif char == '}':
                    braces_count -= 1
                if braces_count == 0:
                    # return when the number of '{' and '}' match
                    return substring[:i+1]

    def __parse_date(self, date_string):
    # handle date range
        if "–" in date_string:
            date_range = date_string.split("–")

            # parse start and end time separately
            start_date_str, end_date_str = date_range[0], date_range[1]
            start_date = parse(start_date_str, tzinfos=self.tzinfos)
            end_date = parse(end_date_str, tzinfos=self.tzinfos)

            # if end_date is earlier than start_date, it means event ends on the next day
            if end_date.replace(tzinfo=None) < start_date.replace(tzinfo=None):
                end_date = end_date + timedelta(days=1)

            # if end_date doesn't include the year, copy it from start_date
            if end_date.year == start_date.year and end_date.month < start_date.month:
                end_date = end_date.replace(year=start_date.year)

            utc_start_time = start_date.astimezone(tz.tzutc())
            formatted_start_time = utc_start_time.strftime('%Y-%m-%dT%H:%M:%S')

            utc_end_time = end_date.astimezone(tz.tzutc())
            formatted_end_time = utc_end_time.strftime('%Y-%m-%dT%H:%M:%S')

            return formatted_start_time, formatted_end_time

        # handle single date
        else:
            date = parser.parse(date_string, tzinfos=self.tzinfos)

            utc_start_time = date.astimezone(tz.tzutc())
            formatted_start_time = utc_start_time.strftime('%Y-%m-%dT%H:%M:%S')

            # End of the day is 23:59:59
            end_of_day = date.replace(hour=23, minute=59, second=59)
            utc_end_time = end_of_day.astimezone(tz.tzutc())
            formatted_end_time = utc_end_time.strftime('%Y-%m-%dT%H:%M:%S')
            
            return formatted_start_time, formatted_end_time




    def __categorize_event(self, event_data):
        event_data_json = json.dumps(event_data)
        prompt = f"respond to the following prompt with one word: `categorize this event type: '{event_data_json}'`"

        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            temperature=0.5,
            max_tokens=10
        )

        response_text = response.choices[0].text.strip()
        response_text_capitalized = response_text[0].upper() + response_text[1:]
        if response_text_capitalized == "Event":
            response_text_capitalized = "Generic"
        return response_text_capitalized


    def process_events(self, file_location, file_date):
        source_dir = os.path.join(self.__facebook_eventpages_dir, file_location, file_date)


        success_dir = os.path.join(self.__facebook_event_data_json_dir, file_location, file_date, 'success')
        error_dir = os.path.join(self.__facebook_event_data_json_dir, file_location, file_date, 'error')

        file_date_dt = datetime.strptime(file_date, '%Y-%m-%d')

        self.__prepare_directory(success_dir)
        self.__prepare_directory(error_dir)

        for filename in os.listdir(source_dir):
            filename_ext_split = os.path.splitext(filename)[0]
            
            read_file_full_path = os.path.join(source_dir, filename)

            with open(read_file_full_path, 'r') as f:
                document = f.read()

            event_description = self.__get_event_description(document)

            # Parsing HTML
            tree = html.fromstring(document)

            # XPath to get all <script> tags
            script_tags = tree.xpath('//script')
            for script in script_tags:
                try:
                    if script is not None and script.text is not None and 'handleWithCustomApplyEach(ScheduledApplyEach,{"require":[["PublicEventCometRSVPButtonGroupRenderer_rsvpStyleRenderer$normalization.graphql"]' in script.text:
                        
                        event_data = json.loads(self.__find_bbox_value(script.text))['result']['data']['event']
                        start_time, end_time = self.__parse_date(event_data["day_time_sentence"])

                        if datetime.strptime(end_time, '%Y-%m-%dT%H:%M:%S') < file_date_dt:
                            continue

                        venue = event_data["event_place"]["name"]
                        if venue.lower() == "online event":
                            continue
                        geodata = self.helper_functions.get_geodata_from_venue_name(venue)

                        relevant_event_data = {
                            "Source": "facebook",
                            "SourceEventID": event_data['id'],
                            "StartTimestamp": start_time,
                            "EndTimestamp": end_time,
                            "Host": venue,
                            "Address": geodata['address'],
                            "Lat": geodata['latitude'],
                            "Lon": geodata['longitude'],
                            "PublicEventFlag": True if event_data["event_kind"] == "PUBLIC_TYPE" else False,
                            "EventName": event_data["name"],
                            "EventDescription": event_description,
                        }

                        event_type = self.__categorize_event(relevant_event_data)
                        relevant_event_data['EventType'] = event_type

                        with open(os.path.join(success_dir, f'{filename_ext_split}.json'), 'w') as f:
                            json.dump(relevant_event_data, f, indent=4)
                        
                except Exception as error:
                    with open(os.path.join(error_dir, f'{filename_ext_split}.json'), 'w') as f:
                        json.dump(document, f, indent=4)
                    print(f"Error {filename_ext_split}:", traceback.format_exc())
        
    def fetch_event_page_data(self, full_file_path, file_location, file_date):
        with open(full_file_path, 'r') as f:
            source = f.read()

        event_page_sub_dir_full_path = os.path.join(self.__facebook_eventpages_dir, file_location, file_date)
        os.makedirs(event_page_sub_dir_full_path, exist_ok=True)

        document = html.document_fromstring(source)

        xpath_expr = "/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div/div/div/div[2]/div/div/div/div/div/div/a"

        elements = document.xpath(xpath_expr)
        hrefs = [element.get('href') for element in elements]

        print(f"hrefs: {hrefs}")


        for i, link in enumerate(hrefs):
            self.driver.get(link)
            content = self.driver.page_source
            output_file_full_path = os.path.join(event_page_sub_dir_full_path, f'event_{i}.html')

            with open(output_file_full_path, 'w') as f:
                f.write(content)
    
    def fetch_homepage_by_location_and_date(self, location: int, event_date: str):
            location_id = facebook_location_ids[location]
            
            self.driver.get(self.__facebook_events_homepage_url.format(location_id=location_id, event_date=event_date))
            content = self.driver.page_source

            filename = f'{event_date}_{location}.html'
            filename_full_path = os.path.join(self.__facebook_homepages_dir, filename)
            with open(filename_full_path, 'w') as f:
                f.write(content)


    def fetch_homepages_in_date_range(self, start_date: str, end_date: str):
        start_date_dt = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')

        for key in facebook_location_ids.keys():
            for date in date_range(start_date_dt, end_date_dt, freq='d'):
                date_str = date.strftime('%Y-%m-%d')
                self.fetch_homepage_by_location_and_date(location=key, event_date=date_str)

    def run(self):
        homepages = os.listdir(self.__facebook_homepages_dir)
        for filename in homepages:
            full_file_path = os.path.join(self.__facebook_homepages_dir, filename)
            
            filename_split_ext = os.path.splitext(filename)[0]
            file_split = filename_split_ext.split('_')


            file_date = file_split[0]
            file_location = file_split[1]

            self.fetch_event_page_data(full_file_path, file_location, file_date)
            self.process_events(file_location, file_date)



if __name__ == "__main__":
    handler = FacebookEventDataHandler()
    # handler.fetch_homepages_in_date_range(start_date='2023-05-22', end_date='2023-05-24')
    handler.run()
