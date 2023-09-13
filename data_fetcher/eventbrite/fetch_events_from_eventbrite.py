#! /usr/bin/python3.8
import abc, os, json, traceback, sys
from uuid import uuid4
import pandas as pd
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from  db import rds_queries
from db import queries
from db.metadata_db_handler import MetadataHandler
from utils.constants import DATETIME_FORMAT
from utils.aws_handler import AWSHandler
from utils.logger import Logger

from bs4 import BeautifulSoup

class DataRecordHandler(MetadataHandler, abc.ABC):
    def __init__(self, row: pd.Series, logger: Logger=None):
        if logger is None:
            logger = Logger(log_group_name=f"eventbrite_data_handler")
        self.logger = logger
        super().__init__(logger=self.logger)
        self.neo4j = Neo4jDB(logger=self.logger)

        self.row = row
        self.uuid = str(uuid4())
        self.row['UUID'] = self.uuid
        self.bucket_name = "evently-data-scraper"

        self.root_dir = self.row['source']
        self.homepages_dir = os.path.join(self.root_dir, 'homepages')
        self.eventpages_dir = os.path.join(self.root_dir, 'eventpages')
        self.event_data_json_dir = os.path.join(self.root_dir, 'event_data_json')

        self.city_code=self.row['city_code']
        self.date=self.row['date']
        self.source_event_type_id=self.row['source_event_type_id']

        self.homepage_prefix = os.path.join(self.homepages_dir, self.date, self.city_code, self.source_event_type_id)
        self.eventpages_date_city_prefix = os.path.join(self.eventpages_dir, self.date, self.city_code, self.source_event_type_id)
        self.event_data_json_prefix = os.path.join(self.event_data_json_dir, self.date, self.city_code, self.source_event_type_id)

        self.success_record_count = 0
        self.error_record_count = 0
        self.virtual_record_count = 0

        chrome_options = Options()
        chrome_options.add_argument("--headless")

        self.driver = webdriver.Chrome(options=chrome_options)

        self.event_data = {}

    @abc.abstractmethod
    def parse_homepages(self, city: str, date_str: str):
        pass

    @abc.abstractmethod
    def parse_eventpages(self, city: str, date_str: str):
        pass

    def download_and_save_page_to_s3(self, url: str, output_file_key: str):
        try:
            self.logger.info(f"Fetching webpage content for {url}")
            self.driver.get(url)
            html_source = self.driver.page_source
            self.logger.info(f"Saving webpage content to S3")
            self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
            self.logger.info(f"Done saving webpage content to S3")

        except Exception as e:
            self.logger.error(msg=f"Error fetching homepage for {url}")
            self.logger.error(msg=e)
            self.logger.error(msg=traceback.format_exc())
            raise e
    
    def __load_event(self, event_data: dict):
        event_query_response = self.neo4j.execute_query_with_params(
            query=queries.CHECK_IF_EVENT_EXISTS, params=event_data
        )
        
        raw_event_data_dict = {
            "UUID": event_data['UUID'],
            "source": event_data['Source'],
            "source_id": self.row['source_id'],
            "event_url": event_data['EventURL'],
            "ingestion_status": "SUCCESS",
            "ingestion_uuid": self.uuid,
            "region_id": self.row['region_id'],
            "event_start_date": self.row['date'],
            "s3_link": event_data.get('S3Link', ''),
            "error_message": ""
        }
        if len(event_query_response) == 0:
            self.neo4j.execute_query_with_params(query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data)
            
            self.insert_raw_event(record=raw_event_data_dict)
            self.insert_event_successfully_ingested(record=event_data)
    
    def load_events_to_neo4j(self):
        self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_EVENTPAGES")
        location_date_prefix = os.path.join(self.event_data_json_dir, self.date, self.city_code, self.source_event_type_id)
        
        for prefix in self.aws_handler.list_files_and_folders_in_s3_prefix(bucket=self.bucket_name, prefix=location_date_prefix)['folders']:
            success_matched_folder_prefix = os.path.join(prefix, "success")
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

        self.logger.info(msg="Done loading events for location: {}, date: {}, source_event_type_id".format(self.city_code, self.date, self.source_event_type_id))

        self.close_ingestion_attempt(uuid=self.uuid, status="SUCCESS", success_count=self.success_record_count, error_count=self.error_record_count, virtual_count=self.virtual_record_count)

    def run(self):
        self.download_homepages()
        self.parse_homepages()
        self.parse_eventpages()
        self.load_events_to_neo4j()

class EventbriteDataHandler(DataRecordHandler):
    def __init__(self, row: pd.Series, aws_handler: AWSHandler, logger: Logger=None):
        self.event_data_script_type = "application/ld+json"
        row['city_code'] = row['city_code'].replace(" ", "-")
            
        if logger is None:
            logger = Logger(log_group_name=f"eventbrite_data_handler")
        self.logger = logger
        if aws_handler is None:
            aws_handler = AWSHandler(logger=self.logger)
        self.aws_handler = aws_handler

        super().__init__(row=row, logger=self.logger)

        self.eventbrite_date_format = '%Y-%m-%dT%H:%M:%SZ'

    def download_homepages(self):
        self.insert_ingestion_attempt(row=self.row)
        for page_no in range(1,2):
            output_file_key = os.path.join(self.homepage_prefix, f"homepage_{page_no}.html")
            url = self.row['source_url'].format(
                    state_code=self.row['state_code'],
                    city_code=self.city_code,
                    event_type_id=self.source_event_type_id,
                    page_no=page_no,
                    start_date=self.date,
                    end_date=self.date
                )
            self.download_and_save_page_to_s3(url=url, output_file_key=output_file_key)
        self.update_ingestion_attempt(uuid=self.uuid, status="HOMEPAGES_COPIED_TO_S3")

    def parse_homepages(self):
        self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_HOMEPAGES")
        self.logger.info(f"Parsing homepages for Date: {self.date}\nCity: {self.city_code}\nEvent Type: {self.source_event_type_id}")
        input_key_prefix = os.path.join(self.homepages_dir, self.date, self.city_code, self.source_event_type_id)
        file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=input_key_prefix)['Contents']]

        for filename in file_list:

            page_no = os.path.splitext(filename.split('/')[-1])[0].split("_")[1]
            output_key_prefix = os.path.join(self.eventpages_dir, self.date, self.city_code, self.source_event_type_id, page_no)
            
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
        self.update_ingestion_attempt(uuid=self.uuid, status="HOMEPAGES_PARSED")

    def parse_eventpages(self):
        self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_EVENTPAGES")
        self.logger.info(f"Parsing eventpages for\nDate: {self.date}City: {self.city_code}\n")

        file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=self.eventpages_date_city_prefix)['Contents']]

        for file_key in file_list:
            page_no = file_key.split('/')[-2]

            event_json_data_page_no_prefix = os.path.join(self.event_data_json_prefix, page_no)
            event_data_json_error_prefix = os.path.join(event_json_data_page_no_prefix, "error")
            event_data_json_success_prefix = os.path.join(event_json_data_page_no_prefix, "success")
            event_data_json_success_online_prefix = os.path.join(event_data_json_success_prefix, "online")

            event_filename = f"{os.path.splitext(file_key.split('/')[-1])[0]}.json"
            full_file_key_matched = os.path.join(event_data_json_success_prefix, event_filename)

            file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=full_file_key_matched)
            if file_exists_boolean:
                self.logger.info(f"File {full_file_key_matched} already exists in S3. Skipping...")
                continue

            html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=file_key)
            soup = BeautifulSoup(html_source, 'lxml')
            scripts = soup.find_all('script')

            event_uuid = str(uuid4())
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
                        if "online" in address_lower or "virtual" in address_lower:
                            self.virtual_record_count += 1
                            full_path_file_name = os.path.join(event_data_json_success_online_prefix, event_filename)
                        else:
                            self.success_record_count += 1
                            full_path_file_name = full_file_key_matched
                        
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
                self.error_record_count += 1
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=full_path_event_data_json_file, data=json.dumps(error_data, indent=4))

            except Exception as e:
                self.logger.error(traceback.format_exc())

                self.error_record_count += 1
                full_path_event_data_json_file = os.path.join(event_data_json_error_prefix, event_filename)
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=full_path_event_data_json_file, data=str(traceback.format_exc()))
        
        self.update_ingestion_attempt(uuid=self.uuid, status="EVENTPAGES_PARSED")


if __name__ == "__main__":
    handler = EventbriteDataHandler()
    handler.run()
