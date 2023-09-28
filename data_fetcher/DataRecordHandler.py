#! /usr/bin/python3.8
import abc, os, json, traceback, sys
from uuid import uuid4
import pandas as pd

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db import queries
from db.db_handler import Neo4jDB
from db.metadata_db_handler import MetadataHandler
from utils.logger import Logger


class DataRecordHandler(MetadataHandler, abc.ABC):
    def __init__(self, row: pd.Series, logger: Logger=None):
        if logger is None:
            logger = Logger(log_group_name=f"data_handler")
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
        self.event_data_json_error_prefix = os.path.join(self.event_data_json_prefix, "error")
        self.event_data_json_success_prefix = os.path.join(self.event_data_json_prefix, "success")
        self.event_data_json_online_prefix = os.path.join(self.event_data_json_prefix, "online")

        self.success_record_count = 0
        self.error_record_count = 0
        self.virtual_record_count = 0

        chrome_options = Options()
        chrome_options.add_argument("--headless")

        self.driver = webdriver.Chrome(options=chrome_options)

        self.event_data = {}
        self.neo4j_datetime_format = "%Y-%m-%dT%H:%M:%S"

    @abc.abstractmethod
    def download_homepages(self):
        pass

    @abc.abstractmethod
    def parse_homepages(self):
        pass

    @abc.abstractmethod
    def parse_eventpages(self):
        pass

    
    def __load_event(self, event_data: dict):
        event_query_response = self.neo4j.execute_query_with_params(
            query=queries.CHECK_IF_EVENT_EXISTS, params=event_data
        )
        if len(event_query_response) == 0:
            self.neo4j.execute_query_with_params(query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data)

            
            self.update_raw_event_ingestion_status(uuid=event_data['UUID'], status="SUCCESS")
            self.insert_event_successfully_ingested(record=event_data)
        else:
            self.update_raw_event_ingestion_status(uuid=event_data['UUID'], status="DUPLICATE_RECORD")
    
    def load_events_to_neo4j(self):
        self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_EVENTPAGES")
        location_date_event_type_success_prefix = os.path.join(self.event_data_json_dir, self.date, self.city_code, self.source_event_type_id, 'success')
        
        for event_file_key in self.aws_handler.list_files_and_folders_in_s3_prefix(bucket=self.bucket_name, prefix=location_date_event_type_success_prefix)['files']:
            self.logger.info(msg="Loading event: {}".format(event_file_key))
            event_data_dict_raw = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=event_file_key)
            event_data_dict = json.loads(event_data_dict_raw)

            try:
                self.__load_event(event_data=event_data_dict)
            except Exception as e:
                self.update_raw_event_ingestion_status(uuid=event_data_dict['UUID'], status="ERROR", error_message=str(e))
                self.logger.error(msg="Error loading event: {}".format(event_file_key))
                self.logger.error(msg=e)
                self.logger.error(msg=traceback.format_exc())
                continue

        self.logger.info(msg="Done loading events for location: {}, date: {}, source_event_type_id: {}".format(self.city_code, self.date, self.source_event_type_id))
        self.close_ingestion_attempt(uuid=self.uuid, status="SUCCESS", success_count=self.success_record_count, error_count=self.error_record_count, virtual_count=self.virtual_record_count)

    def parent_download_homepages(self):
        try:
            self.logger.info("parent_download_homepages")
            self.insert_ingestion_attempt(row=self.row)
            self.download_homepages()
            self.logger.info(f"Done saving webpage content to S3")
            self.update_ingestion_attempt(uuid=self.uuid, status="HOMEPAGES_COPIED_TO_S3")

        except Exception as e:
            self.update_ingestion_attempt(uuid=self.uuid, status="ERROR_DOWNLOADING_HOMEPAGES")
            raise e
    
    def parent_parse_homepages(self):
        try:
            self.logger.info(f"Parsing homepages for Date: {self.date}\nCity: {self.city_code}\nEvent Type: {self.source_event_type_id}")
            self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_HOMEPAGES")
            input_key_prefix = os.path.join(self.homepages_dir, self.date, self.city_code, self.source_event_type_id)
            file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=input_key_prefix)['Contents']]
            self.parse_homepages(file_list=file_list)
            self.logger.info(f"Done parsing homepages")
            self.update_ingestion_attempt(uuid=self.uuid, status="HOMEPAGES_PARSED")
        except Exception as e:
            self.update_ingestion_attempt(uuid=self.uuid, status="ERROR_PARSING_HOMEPAGES")
            raise e
    
    def parent_parse_eventpages(self):
        try:
            self.logger.info(f"Parsing eventpages for Date: {self.date}\nCity: {self.city_code}\nEvent Type: {self.source_event_type_id}")
            self.update_ingestion_attempt(uuid=self.uuid, status="PARSING_EVENTPAGES")
            file_list = [rec['Key'] for rec in self.aws_handler.list_files_in_s3_prefix_recursive(bucket=self.bucket_name, prefix=self.eventpages_date_city_prefix)['Contents']]
            self.parse_eventpages(file_list=file_list)
            self.logger.info(f"Done parsing eventpages")
            self.update_ingestion_attempt(uuid=self.uuid, status="EVENTPAGES_PARSED")
        except Exception as e:
            self.update_ingestion_attempt(uuid=self.uuid, status="ERROR_PARSING_EVENTPAGES")
            raise e
    
    def run(self):
        self.parent_download_homepages()
        self.parent_parse_homepages()
        self.parent_parse_eventpages()
        self.load_events_to_neo4j()
