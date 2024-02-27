#! /usr/bin/python3.8
import os, json, traceback, sys, re
from datetime import datetime
from uuid import uuid4
import requests

import pandas as pd

from dotenv import load_dotenv

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from DataRecordHandler import DataRecordHandler
from utils.aws_handler import AWSHandler
from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.constants import DATETIME_FORMAT

load_dotenv()

class GoogleEventsApiDataHandler:
  def __init__(self, row: pd.Series, aws_handler: AWSHandler):
    self.event_data_script_type = "application/ld+json"
    # row['city_code'] = row['city_code'].replace(" ", "-")
    self.row = row
    self.ingestion_uuid = str(uuid4())
    self.row['ingestion_uuid'] = self.ingestion_uuid
    
    self.source = self.row['source']
    self.date = self.row['date']
    self.city_code = self.row['city_code']
    self.region_id = self.row['region_id']
    self.state_code = self.row['state_code']
    self.country_code = self.row['country_code']
    self.source_event_type = self.row['source_event_type']
    self.target_event_type_string = self.row['target_event_type_string']
    self.target_event_type_uuid = self.row['target_event_type_uuid']
    
    self.logger = Logger(name=f"data_handler/{self.source}_{self.date}_{self.city_code}_{self.source_event_type}_{self.ingestion_uuid}")
    self.helper_functions = HelperFunctions(logger=self.logger)
    
    self.request_headers = {
      'x-api-key': os.getenv('GOOGLE_EVENTS_API_KEY'),
    }
    
    self.geolocation_regex_pattern = r"1s(.*?)(?=\?)"
    

  def parse_datetime_range(self, datetime_range: str):
    # Normalize space and dash characters
    datetime_range = datetime_range.replace('\u202f', ' ').replace('\u2009', ' ').replace('–', '-')
    
    # Patterns to match the different datetime formats
    full_pattern_with_minutes = r"(\w+, \w+ \d+, \d+:\d+ [AP]M) - (\w+, \w+ \d+, \d+:\d+ [AP]M)"
    full_pattern_without_minutes = r"(\w+, \w+ \d+, \d+ [AP]M) - (\w+, \w+ \d+, \d+ [AP]M)"
    same_day_pattern_with_minutes = r"(\w+, \w+ \d+, \d+:\d+ [AP]M) - (\d+:\d+ [AP]M)"
    same_day_pattern_without_minutes = r"(\w+, \w+ \d+, \d+)(?::\d+)?(?: [AP]M)? - (\d+)(?::\d+)? ([AP]M)"
    all_day_pattern = r"(\w+, \w+ \d+) - (\w+, \w+ \d+)"
    
    if re.match(full_pattern_with_minutes, datetime_range):
        format = "%a, %b %d, %I:%M %p"
        start_str, end_str = re.match(full_pattern_with_minutes, datetime_range).groups()
    elif re.match(full_pattern_without_minutes, datetime_range):
        format = "%a, %b %d, %I %p"
        start_str, end_str = re.match(full_pattern_without_minutes, datetime_range).groups()
    elif re.match(same_day_pattern_with_minutes, datetime_range):
        import pdb; pdb.set_trace()
      
        start_str, end_time_str = re.match(same_day_pattern_with_minutes, datetime_range).groups()
        start_date_str = " ".join(start_str.split()[:3])
        format = "%a, %b %d, %I:%M %p"
        start_str = datetime.strptime(start_str, format)
        end_str = datetime.strptime(f"{start_date_str}, {end_time_str}", format)
    elif re.match(same_day_pattern_without_minutes, datetime_range):
        import pdb; pdb.set_trace()
      
        start_str, end_time_str = re.match(same_day_pattern_without_minutes, datetime_range).groups()
        start_date_str = " ".join(start_str.split()[:3])
        format = "%a, %b %d, %I:%M %p" if ':' in start_str else "%a, %b %d, %I %p"
        start_str = datetime.strptime(start_str, format)
        end_str = datetime.strptime(f"{start_date_str}, {end_time_str}", f"%a, %b %d, {end_time_str}")
    elif re.match(all_day_pattern, datetime_range):
        start_date_str, end_date_str = re.match(all_day_pattern, datetime_range).groups()
        start_str = datetime.strptime(start_date_str, "%a, %b %d").replace(hour=0, minute=0)
        end_str = datetime.strptime(end_date_str, "%a, %b %d").replace(hour=23, minute=59)
    else:
        import pdb; pdb.set_trace()
      
        # Handle unexpected format or log an error
        return None, None
    
    # For formats with explicit start and end datetimes
    if 'start_str' in locals() and isinstance(start_str, str):
        start_datetime = datetime.strptime(start_str, format)
        end_datetime = datetime.strptime(end_str, format)
        start_datetime = start_datetime.replace(year=datetime.now().year)
        end_datetime = end_datetime.replace(year=datetime.now().year)
    else:
        start_datetime, end_datetime = start_str, end_str
    
    return start_datetime, end_datetime


  def fetch_events_for_event_type(self):
    start = 0
    proceed = True
    
    data = []

    try:
      for i in range(1):
          
        url = self.row['source_url'].format(
          state_code=self.state_code,
          city_code=self.city_code,
          country_code=self.country_code,
          event_type=self.source_event_type,
          start=start
        )

        response = requests.get(url, headers=self.request_headers)
        if response.status_code == 200:
          
          response_json = json.loads(response.content.decode())
          events = response_json['eventsResults']
          
          
          for event in events:
            with open("output.json", "w") as f:
              json.dump(event, f)
            event_address = ', '.join(event['address'])
            try:
              lat_lon = self.helper_functions.get_lat_lon_from_address(event_address)
              lat = lat_lon['lat']
              lon = lat_lon['lng']
              
              start_datetime, end_datetime = self.parse_datetime_range(datetime_range=event['date']['when'])
              
              formatted_timezone = self.helper_functions.get_timezone_from_lat_lng(latitude=lat, longitude=lon)
              starttime_utc = self.helper_functions.convert_to_utc(datetime_obj=start_datetime, timezone_str=formatted_timezone)
              starttime_utc_str = starttime_utc.strftime(DATETIME_FORMAT)
              
              endtime_utc = self.helper_functions.convert_to_utc(datetime_obj=end_datetime, timezone_str=formatted_timezone)
              endtime_utc_str = endtime_utc.strftime(DATETIME_FORMAT)

              event_data = {
                'source': self.source,
                'region_id': self.region_id,
                'ingestion_uuid': self.ingestion_uuid,
                'Address': event_address,
                'EventType': self.target_event_type_string,
                'EventTypeUUID': self.target_event_type_uuid,
                'StartTimestamp': starttime_utc_str,
                'EndTimestamp': endtime_utc_str,
                'ImageURL': event['link'],
                'Host': event['venue']['name'],
                'Lon': lon,
                'Lat': lat,
                'Summary': event['description'],
                'PublicEventFlag': True,
                'FreeEventFlag': True,
                'Price': 0,
                'EventDescription': event['description'],
                'EventName': event['title'],
                'SourceEventID': event['link'],
                'eventpageurl': event['link'],
                
              }
              
              print(event_data)
              data.append(event_data)
            except Exception as e:
              self.logger.error(f"Error fetching events for {url}")
              self.logger.error(e)
              self.logger.error(traceback.format_exc())
              continue
            
            
          self.logger.info(f"Successfully fetched events for {url}")
        else:
          self.logger.error(f"Error fetching events for {url}")
          self.logger.error(f"Response Code: {response.status_code}")
        
        self.logger.info(f"Saving webpage content to S3")
        # self.aws_handler.write_to_s3(bucket=self.bucket_name, key=output_file_key, data=html_source)
    except Exception as e:
      self.logger.error(msg=f"Error fetching homepage for {url}")
      self.logger.error(msg=e)
      self.logger.error(msg=traceback.format_exc())
    
  def run(self):
    self.fetch_events_for_event_type()
    self.logger.info(f"Successfully fetched events for {self.row['source']}_{self.date}_{self.city_code}_{self.source_event_type}_{self.ingestion_uuid}")
    # self.update_ingestion_status()
    self.logger.info(f"Updated ingestion status for {self.row['source']}_{self.date}_{self.city_code}_{self.source_event_type}_{self.ingestion_uuid}")
    # self.logger.info(f"Success count: {self.success_record_count}, Error count: {self.error_record_count}, Virtual count: {self.virtual_record_count}")
    self.logger.info(f"Exiting {self.row['source']}_{self.date}_{self.city_code}_{self.source_event_type}_{self.ingestion_uuid}")
    