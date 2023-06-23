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
from utils.constants import facebook_location_ids, DATETIME_FORMAT


class FacebookEventDataHandler:
    def __init__(self):
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)
    
        self.OPEN_AI_API_KEY = os.environ.get("OPEN_AI_API_KEY")
        self.tzinfos = {"EDT": tzoffset("EDT", -4 * 3600)}
        # if not self.OPEN_AI_API_KEY:
        #     raise Exception('OPEN_AI_API_KEY environment variable not set.')
        # else:
        #     openai.api_key = self.OPEN_AI_API_KEY

        self.__facebook_events_homepage_url = "https://www.facebook.com/events/?date_filter_option=CUSTOM_DATE_RANGE&discover_tab=CUSTOM&end_date={event_date}T04%3A00%3A00.000Z&location_id={location_id}&start_date={event_date}T04%3A00%3A00.000Z"

        self.logger = Logger(__name__)
        self.helper_functions = HelperFunctions(logger=self.logger)
        openai.api_key = self.helper_functions.get_open_ai_api_key()

        self.__facebook_events_dir = os.getcwd()
        
        self.__facebook_homepages_dir = os.path.join(
            self.__facebook_events_dir, "homepages"
        )
        self.__facebook_eventpages_dir = os.path.join(
            self.__facebook_events_dir, "eventpages"
        )
        self.__facebook_event_data_json_dir = os.path.join(
            self.__facebook_events_dir, "event_data_json"
        )

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
                    print(f"Failed to delete {file_path}. Reason: {e}")
        else:
            os.makedirs(directory_path)

    def __get_event_description(self, text):
        match = re.search(r'"event_description":\{"text":"(.*?)"', text)

        if match:
            event_description = match.group(1)
            return event_description
        else:
            print('No "event_description" found in the HTML document text.')
            return ""
    
    @staticmethod
    def __get_values_associated_with_key(text, key):
        pattern = re.compile(r'"event_place"\s*:\s*\{')

        start_positions = [m.end() - 1 for m in pattern.finditer(text)]
        values = []

        for start in start_positions:
            # A stack to keep track of unmatched opening brackets
            bracket_stack = ['{']
            i = start + 1  # We start after the first opening bracket

            while bracket_stack:
                if text[i] == '{':
                    bracket_stack.append('{')
                elif text[i] == '}':
                    bracket_stack.pop()
                i += 1

            # The dictionary ends at the position of the matching closing bracket
            end = i - 1

            # Extract the dictionary and add it to the list
            value = text[start:end + 1]
            values.append(value)
        
        return values
    
    def get_event_location(self, text):
        event_place_values = self.__get_values_associated_with_key(text, 'event_place')

        for string_value in event_place_values:
            if all(substring in string_value for substring in ["longitude", "latitude"]):
                value_dict = json.loads(string_value)
                # street_address = value_dict['address']['street']
                # city = value_dict['city']['contextual_name']
                # full_address = f'{street_address}, {city}'

                lon_lat = value_dict['location']
                latitute = lon_lat['latitude']
                longitude = lon_lat['longitude']

                full_address = self.helper_functions.get_address_from_lat_lon(lat=latitute, lon=longitude)

                return {"address": full_address, "latitude": latitute, "longitude": longitude}

        return None

    def __find_bbox_value(self, s):
        match = re.search(r'"__bbox":({.*})', s)
        if match:
            # substring starting from "__bbox":
            substring = match.group(1)

            # Find the end of the JSON by counting opening and closing braces
            braces_count = 0
            for i, char in enumerate(substring):
                if char == "{":
                    braces_count += 1
                elif char == "}":
                    braces_count -= 1
                if braces_count == 0:
                    # return when the number of '{' and '}' match
                    return substring[: i + 1]

    def __parse_timestamp_to_utc_date(self, start_timestamp: int, end_timestamp: int, location_data: dict):
        timezone_str = self.helper_functions.get_timezone_from_lat_lon_timestamp(lat=location_data["latitude"], lon=location_data["longitude"], timestamp=start_timestamp)
        tz = pytz.timezone(timezone_str)
        
        # Parse the timestamp
        start_timestamp_utc = datetime.fromtimestamp(start_timestamp)

        if end_timestamp == 0:
            start_timestamp_local = start_timestamp_utc.astimezone(tz)
            end_timestamp_local = start_timestamp_local.replace(hour=23, minute=59, second=59)
            end_timestamp_utc = end_timestamp_local.astimezone(pytz.UTC)
        else:
            end_timestamp_utc = datetime.fromtimestamp(end_timestamp)

        start_timestamp_utc_str = start_timestamp_utc.strftime(DATETIME_FORMAT)
        end_timestamp_utc_str = end_timestamp_utc.strftime(DATETIME_FORMAT)

        return start_timestamp_utc_str, end_timestamp_utc_str
        
    
    def categorize_event(self, event_data: dict, choices: list):
        prompt = f'''respond to the following prompt with the format `{{"MATCHED": (true|false), "CONFIDENCE_LEVEL":<confidence_level>,
                    "EVENT_TYPE_NAME":"<EventType>"}}`: `categorize this event based on the following data {event_data}
                    from the following list of already-existing event types: {choices}. also generate a confidence level
                    for your match that ranges between 0 and 1. if your confidence-level is 0.75 or higher, 
                    return your answer in the following format: {{"MATCHED": true, "CONFIDENCE_LEVEL":<confidence_level>,
                    "EVENT_TYPE_NAME":"<EventType>"}}. if the confidence-level is below 0.75, propose a new category name
                    for the EventType and return your answer in the following format: {{"MATCHED": false,
                    "CONFIDENCE_LEVEL":<confidence_level>, "EVENT_TYPE_NAME":"<EventType>"}}. make sure that your proposed
                    category name is general enough to apply to other events, rather than just this one.`'''

        response = openai.Completion.create(engine="text-davinci-002", prompt=prompt, temperature=0.5, max_tokens=100)

        response_text = response.choices[0].text.strip()
        response_json = json.loads(response_text)
        response_json['EVENT_TYPE_NAME'] = response_json['EVENT_TYPE_NAME'][0].upper() + response_json['EVENT_TYPE_NAME'][1:]
        response_json['EVENT_TYPE_NAME'] = response_json['EVENT_TYPE_NAME'].replace(" Event", "")
        if response_json['EVENT_TYPE_NAME'] == "Event":
            response_json['EVENT_TYPE_NAME'] = "Generic"
        return response_json

    def process_events(self, file_location, file_date):
        source_dir = os.path.join(self.__facebook_eventpages_dir, file_location, file_date)
        success_dir = os.path.join(self.__facebook_event_data_json_dir, file_location, file_date, "success")
        error_dir = os.path.join(self.__facebook_event_data_json_dir, file_location, file_date, "error")

        file_date_dt = datetime.strptime(file_date, "%Y-%m-%d")

        self.__prepare_directory(success_dir)
        self.__prepare_directory(error_dir)

        event_type_mappings = self.neo4j.execute_query(query=queries.GET_EVENT_TYPE_NAMES_MAPPINGS)
        event_type_list = [event_type["EventType"] for event_type in event_type_mappings]
        

        event_data_json = []
        for filename in os.listdir(source_dir):
            filename_ext_split = os.path.splitext(filename)[0]

            read_file_full_path = os.path.join(source_dir, filename)

            with open(read_file_full_path, "r") as f:
                document = f.read()

            event_description = self.__get_event_description(document)

            match = re.search(r'{"__bbox":{"complete":(true|false),"result":{"label":"PublicEventCometAboutOneColumn_event\$defer\$EventCometLineupsCardMeta_event","path":\["event"\],"data":{"tz_display_name":"\w+","viewer_in_event_tz":(true|false),"start_timestamp":\d+,"end_timestamp":\d+},"extensions":{"is_final":(true|false)}},"sequence_number":\d+}}', document)
            if match:
                span = match.span()
                timestamps_text = document[span[0]:span[-1]]
                timestamps_dict = json.loads(timestamps_text)
                start_timestamp = timestamps_dict["__bbox"]["result"]["data"]["start_timestamp"]
                end_timestamp = timestamps_dict["__bbox"]["result"]["data"]["end_timestamp"]
            else:
                continue

            tree = html.fromstring(document)

            script_tags = tree.xpath("//script")
            location_data = self.get_event_location(document)

            for script in script_tags:
                try:
                    if (
                        script is not None
                        and script.text is not None
                        and 'handleWithCustomApplyEach(ScheduledApplyEach,{"require":[["PublicEventCometRSVPButtonGroupRenderer_rsvpStyleRenderer$normalization.graphql"]'
                        in script.text
                    ):
                        event_data = json.loads(self.__find_bbox_value(script.text))["result"]["data"]["event"]

                        event_data_json.append(event_data)
                        start_time, end_time = self.__parse_timestamp_to_utc_date(start_timestamp=start_timestamp, end_timestamp=end_timestamp, location_data=location_data)

                        if (datetime.strptime(end_time, DATETIME_FORMAT) < file_date_dt):
                            continue

                        venue = event_data["event_place"]["name"]
                        if venue.lower() == "online event":
                            continue

                        try:
                            relevant_event_data = {
                                "Source": "facebook",
                                "SourceEventID": event_data["id"],
                                "StartTimestamp": start_time,
                                "EndTimestamp": end_time,
                                "Host": venue,
                                "Address": location_data["address"],
                                "Lat": location_data["latitude"],
                                "Lon": location_data["longitude"],
                                "PublicEventFlag": True if event_data["event_kind"] == "PUBLIC_TYPE" else False,
                                "EventName": event_data["name"],
                                "EventDescription": event_description
                            }
                            categorization_response = self.categorize_event(relevant_event_data, choices=event_type_list)
                            print(f"categorization_response: {categorization_response}")
                            relevant_event_data["EventType"] = categorization_response['EVENT_TYPE_NAME']
                            
                        except Exception as error:
                            print(f"Error: {error}")

                        with open(os.path.join(success_dir, f"{filename_ext_split}.json"), "w") as f:
                            f.write(json.dumps(relevant_event_data, indent=4))

                except Exception as error:
                    with open(os.path.join(error_dir, f"{filename_ext_split}.json"), "w") as f:
                        f.write(document)
                    print(f"Error {filename_ext_split}:", traceback.format_exc())
        with open("event_data.json", "w") as f:
            f.write(json.dumps(event_data_json, indent=4))


    def fetch_event_page_data(self, full_file_path, file_location, file_date):
        with open(full_file_path, "r") as f:
            source = f.read()

        event_page_sub_dir_full_path = os.path.join(self.__facebook_eventpages_dir, file_location, file_date)
        
        if os.path.exists(event_page_sub_dir_full_path):
            shutil.rmtree(event_page_sub_dir_full_path)

        os.makedirs(event_page_sub_dir_full_path, exist_ok=True)

        document = html.document_fromstring(source)
        xpath_expr = "/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[3]/div/div/div[1]/div[1]/div[2]/div/div/div/div/div/div/div/div/div[2]/div/div/div/div/div/div/a"

        elements = document.xpath(xpath_expr)
        hrefs = [element.get("href") for element in elements]

        for i, link in enumerate(hrefs[140:]):
            self.driver.get(link)
            content = self.driver.page_source
            
            output_file_full_path = os.path.join(event_page_sub_dir_full_path, f"event_{i}.html")

            with open(output_file_full_path, "w", encoding='utf-8') as f:
                f.write(content)


    def run(self):
        homepages = os.listdir(self.__facebook_homepages_dir)
        for filename in homepages:
            full_file_path = os.path.join(self.__facebook_homepages_dir, filename)

            filename_split_ext = os.path.splitext(filename)[0]
            file_split = filename_split_ext.split("_")

            file_date = file_split[0]
            file_location = file_split[1]

            self.fetch_event_page_data(full_file_path, file_location, file_date)
            self.process_events(file_location, file_date)


if __name__ == "__main__":
    handler = FacebookEventDataHandler()
    # handler.fetch_homepages_in_date_range(start_date='2023-05-22', end_date='2023-05-24')
    handler.run()



    # def fetch_homepage_by_location_and_date(self, location: int, event_date: str):
    #     location_id = facebook_location_ids[location]

    #     self.driver.get(
    #         self.__facebook_events_homepage_url.format(
    #             location_id=location_id, event_date=event_date
    #         )
    #     )
    #     content = self.driver.page_source

    #     filename = f"{event_date}_{location}.html"
    #     filename_full_path = os.path.join(self.__facebook_homepages_dir, filename)
    #     with open(filename_full_path, "w") as f:
    #         f.write(content)

    # def fetch_homepages_in_date_range(self, start_date: str, end_date: str):
    #     start_date_dt = datetime.strptime(start_date, "%Y-%m-%d")
    #     end_date_dt = datetime.strptime(end_date, "%Y-%m-%d")

    #     for key in facebook_location_ids.keys():
    #         for date in date_range(start_date_dt, end_date_dt, freq="d"):
    #             date_str = date.strftime("%Y-%m-%d")
    #             self.fetch_homepage_by_location_and_date(
    #                 location=key, event_date=date_str
    #             )

    # def __get_event_categories(self, text):
    #     # Define the pattern to match in the script tag's content
    #     pattern = re.compile(
    #         r'({"__bbox":.*"event_category_list":.*"sequence_number":0}})'
    #     )

    #     # Search for the pattern
    #     match = pattern.search(text)
    #     if match:
    #         # Extract the JSON string
    #         json_string = match.group(1)

    #         # Load the JSON string into a Python dict
    #         json_data = json.loads(json_string)

    #         # Extract the event_category_list
    #         event_category_list = json_data["__bbox"]["result"]["data"]["viewer"][
    #             "event_category_list"
    #         ]
    #         return event_category_list
    #     else:
    #         return []