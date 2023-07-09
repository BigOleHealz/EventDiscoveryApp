#! /usr/bin/python3.8
import abc, os, json, traceback, sys

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import openai

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries
from utils.aws_handler import AWSHandler
from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.logger import Logger

class DataHandler(abc.ABC):
    def __init__(self, data_source: str):
        self.data_source = data_source
        self.logger = Logger(log_group_name=f"data_ingestion/{self.data_source}")
        self.neo4j = Neo4jDB(logger=self.logger)
        self.aws_handler = AWSHandler(logger=self.logger)
        self.helper_functions = HelperFunctions(logger=self.logger)

        openai.api_key = self.helper_functions.get_open_ai_api_key()

        self.bucket_name = "evently-data-scraper"
        self.root_dir = self.data_source
        self.homepages_dir = os.path.join(self.root_dir, 'homepages')
        self.eventpages_dir = os.path.join(self.root_dir, 'eventpages')
        self.event_data_json_dir = os.path.join(self.root_dir, 'event_data_json')

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
    
    def download_homepages(self, state: str, city: str, date_str: str):
        self.logger.info("Downloading homepages for {city} on {date_str} from {data_source}".format(city=city, date_str=date_str, data_source=self.data_source))
        key_prefix = os.path.join(self.homepages_dir, date_str, city)

        for page_no in range(1,5):
            try:
                output_file_key = os.path.join(key_prefix, f"homepage_{page_no}.html")

                file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=output_file_key)
                if file_exists_boolean:
                    self.logger.info(f"File {output_file_key} already exists in S3. Skipping...")
                    continue
                url = self.homepage_preformatted.format(state=state, city=city, page_no=page_no, date_str=date_str)

                self.driver.get(url)
                html_source = self.driver.page_source
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
                
                self.logger.info(f"Downloaded homepage from {self.data_source}:\nCity: {city}\nDate: {date_str}\nPage No: {page_no}")
            except Exception as e:
                print(traceback.format_exc())
                self.logger.error(f"Error Downloading Homepage {page_no}: {e}")
                self.logger.error(traceback.format_exc())
                import pdb; pdb.set_trace()

    @abc.abstractmethod
    def parse_homepages(self, city: str, date_str: str):
        pass

    @abc.abstractmethod
    def parse_eventpages(self, city: str, date_str: str):
        pass

    def __load_event(self, event_data: dict):
        event_query_response = self.neo4j.execute_query_with_params(
            query=queries.CHECK_IF_EVENT_EXISTS, params=event_data
        )
        if len(event_query_response) == 0:
            self.neo4j.execute_query_with_params(
                query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data
            )
    
    def load_events_to_neo4j(self, city: str, date_str: str):
        location_date_prefix = os.path.join(self.event_data_json_dir, date_str, city)
        
        for prefix in self.aws_handler.list_files_and_folders_in_s3_prefix(bucket=self.bucket_name, prefix=location_date_prefix)['folders']:
            success_matched_folder_prefix = os.path.join(prefix, "success", "matched")
            for event_file_key in self.aws_handler.list_files_and_folders_in_s3_prefix(bucket=self.bucket_name, prefix=success_matched_folder_prefix)['files']:
                self.logger.info(msg="Loading event: {}".format(event_file_key))
                event_data_dict_raw = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=event_file_key)
                event_data_dict = json.loads(event_data_dict_raw)

                try:
                    self.__load_event(event_data=event_data_dict)
                except Exception as e:
                    self.logger.error(msg="Error loading event: {}".format(event_file_key))
                    self.logger.error(msg=e)
                    self.logger.error(msg=traceback.format_exc())
                    continue

        self.logger.info(msg="Done loading events for location: {}, date: {}".format(city, date_str))
