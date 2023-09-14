#! /usr/bin/python3.8
import os, json, traceback, sys
from uuid import uuid4
from datetime import date, datetime
import pandas as pd
import pytz

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from DataRecordHandler import DataRecordHandler
from utils.aws_handler import AWSHandler
from utils.logger import Logger

from bs4 import BeautifulSoup

        
class MeetupDataHandler(DataRecordHandler):
    def __init__(self, row: pd.Series, aws_handler: AWSHandler, logger: Logger=None):
        self.event_data_script_type = "application/json"
        row['city_code'] = row['city_code'].replace(" ", "-")
            
        if logger is None:
            logger = Logger(log_group_name=f"meetup_data_handler")
        self.logger = logger
        if aws_handler is None:
            aws_handler = AWSHandler(logger=self.logger)
        self.aws_handler = aws_handler

        super().__init__(row=row, logger=self.logger)

        self.date_time_formatter = "{year}-{month}-{day}T{hour}%3A{minute}%3A{second}-04%3A00"
        self.address_format_string = "{street}, {city}, {state}, {country}"
    
    def __format_start_datetime(self, datetime_object: datetime):
        return (
            self.date_time_formatter.format(
                year=datetime_object.year,
                month=str(datetime_object.month).zfill(2),
                day=str(datetime_object.day).zfill(2),
                hour='00',
                minute='00',
                second='00'
            ),
            self.date_time_formatter.format(
                year=datetime_object.year,
                month=str(datetime_object.month).zfill(2),
                day=str(datetime_object.day).zfill(2),
                hour='23',
                minute='59',
                second='59'
            )
        )

    def download_homepages(self):
        output_file_key = os.path.join(self.homepage_prefix, f"homepage.html")

        datetime_object = datetime.strptime(self.date, '%Y-%m-%d')
        (formatted_start_date, formatted_end_date) = self.__format_start_datetime(datetime_object)
        url = self.row['source_url'].format(
                country_code=self.row['country_code'],
                state_code=self.row['state_code'],
                city_code=self.city_code,
                event_type_id=self.source_event_type_id,
                start_date=formatted_start_date,
                end_date=formatted_end_date
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
                
                output_key_prefix = os.path.join(self.eventpages_dir, self.date, self.city_code, self.source_event_type_id)
                
                html_source = self.aws_handler.read_from_s3(bucket=self.bucket_name, key=filename)

                soup = BeautifulSoup(html_source, 'lxml')
                scripts = soup.find_all('script', attrs={'type': self.event_data_script_type})

                if len(scripts) == 0:
                    self.logger.info(f"No event data found in {filename}")
                    continue

                for i, script in enumerate(scripts):
                    
                    event_data_raw = json.loads(script.string)
                    important_data = event_data_raw['props']['pageProps']['__APOLLO_STATE__']
                    event_keys = [key for key in important_data.keys() if key.startswith("Event:")]
                    raw_event_data = {key : important_data[key] for key in event_keys}

                    for key, value in raw_event_data.items():
                        url = value['eventUrl']
                        
                        source_event_id = value['id']
                        
                        output_file_key = os.path.join(output_key_prefix, source_event_id)

                        file_exists_boolean = self.aws_handler.check_if_s3_file_exists(bucket=self.bucket_name, key=output_file_key)
                        if file_exists_boolean:
                            self.logger.info(f"File {output_file_key} already exists in S3. Skipping...")
                            continue
                        
                        self.driver.get(url)
                        html_source = self.driver.page_source

                        self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
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
            element = soup.find('script', {'id': '__NEXT_DATA__'})
            element_string = element.string
            event_data_raw = json.loads(element_string)

            important_data = event_data_raw['props']['pageProps']['event']

            event_uuid = str(uuid4())

            raw_event_data_dict = {
                "UUID": event_uuid,
                "source": self.row['source'],
                "source_id": self.row['source_id'],
                "event_url": source_event_id,
                "ingestion_uuid": self.uuid,
                "region_id": self.row['region_id'],
                "event_start_date": self.row['date'],
                "error_message": ""
            }

            output_file_key = ''
            try:

                location_details = important_data["venue"]
                address = self.address_format_string.format(
                    street=location_details["address"],
                    city=location_details["city"],
                    state=location_details["state"].upper(),
                    country=location_details["country"].upper()
                )
                event_description = important_data["description"]
                event_url = important_data["eventUrl"]

                event_data_dict = {
                    "UUID": event_uuid,
                    "StartTimestamp" : datetime.fromisoformat(important_data["dateTime"]).astimezone(pytz.UTC).strftime(self.neo4j_datetime_format),
                    "EndTimestamp" : datetime.fromisoformat(important_data["endTime"]).astimezone(pytz.UTC).strftime(self.neo4j_datetime_format),
                    "EventName" : important_data["title"],
                    "Source" : self.row['source'],
                    "SourceEventID": int(important_data["id"]),
                    "EventURL": event_url,
                    "Lon" : location_details["lng"],
                    "Lat" : location_details["lat"],
                    "Address" : address,
                    "Host" : location_details["name"],
                    "PublicEventFlag" : True,
                    "EventDescription" : event_description,
                    "Summary" : event_description,
                    "ImageURL": important_data["imageUrl"],
                    "EventPageURL": event_url,
                    "Price": '$0',
                    "FreeEventFlag": 'Free',
                    "EventTypeUUID": self.row['target_event_type_uuid'],
                    "EventType": self.row['target_event_type_string'],
                    "S3Link": f"s3://{self.bucket_name}/{file_key}",
                }
                
                if location_details["name"] == "Online event":
                    self.virtual_record_count += 1
                    output_file_key = os.path.join(self.event_data_json_online_prefix, event_filename)
                    raw_event_data_dict['ingestion_status'] = "VIRTUAL"
                else:
                    self.success_record_count += 1
                    output_file_key = full_file_key_success
                    raw_event_data_dict['ingestion_status'] = "PENDING"
                
                self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=json.dumps(event_data_dict, indent=4))

            except json.decoder.JSONDecodeError as e:
                output_file_key = os.path.join(self.event_data_json_error_prefix, event_filename)
                error_start = max(0, e.pos - 5)
                error_end = min(len(element_string), e.pos + 6)
                error_context = element_string[error_start:error_end]

                error_data = {
                    "error_message": str(traceback.format_exc()),
                    "json_raw_text": element_string,
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
