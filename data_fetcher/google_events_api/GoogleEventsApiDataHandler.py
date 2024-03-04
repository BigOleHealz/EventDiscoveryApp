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


from db import queries
from db.db_handler import Neo4jDB
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
    self.neo4j = Neo4jDB(logger=self.logger)
    self.helper_functions = HelperFunctions(logger=self.logger)
    
    self.request_headers = {
      'x-api-key': os.getenv('GOOGLE_EVENTS_API_KEY'),
    }
    
    self.geolocation_regex_pattern = r"1s(.*?)(?=\?)"
    
    self.df = pd.DataFrame(columns=[
                                  'Source', 'region_id', 'ingestion_uuid', 'Address', 'EventType', 'EventTypeUUID', 'StartTimestamp',
                                  'EndTimestamp', 'ImageURL', 'Host', 'Lon', 'Lat', 'Summary', 'PublicEventFlag', 'FreeEventFlag',
                                  'Price', 'EventDescription', 'EventName', 'SourceEventID', 'eventpageurl'
                                ])
    

  def __load_event(self, event_data: dict):
    print(f"Loading event: {event_data['EventName']} {event_data['EventTypeUUID']}")
    event_query_response = self.neo4j.execute_query_with_params(
      query=queries.CHECK_IF_EVENT_EXISTS, params=event_data
    )
    if len(event_query_response) == 0:
      self.neo4j.execute_query_with_params(query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data)

    #   self.update_raw_event_ingestion_status(uuid=event_data['UUID'], status="SUCCESS")
    #   self.insert_event_successfully_ingested(record=event_data)
    # else:
    #   self.update_raw_event_ingestion_status(uuid=event_data['UUID'], status="DUPLICATE_RECORD")
        
      
  def parse_datetime_range(self, datetime_range: str):
    # Normalize space and dash characters
    datetime_range = datetime_range.replace('\u202f', ' ').replace('\u2009', ' ').replace('–', '-')
    
    # Patterns to match the different datetime formats
    full_pattern_with_minutes = r"(\w+, \w+ \d+, \d+:\d+ [AP]M) - (\w+, \w+ \d+, \d+:\d+ [AP]M)"
    full_pattern_without_minutes = r"(\w+, \w+ \d+, \d+ [AP]M) - (\w+, \w+ \d+, \d+ [AP]M)"
    same_day_pattern_with_minutes = r"(\w+, \w+ \d+, \d+:\d+ [AP]M) - (\d+:\d+ [AP]M)"
    same_day_pattern_without_minutes = r"(\w+, \w+ \d+, \d+)(?::\d+)?(?: [AP]M)? - (\d+)(?::\d+)? ([AP]M)"
    all_day_pattern = r"(\w+, \w+ \d+) - (\w+, \w+ \d+)"
    
    
    print("datetime_range:", datetime_range)
    if re.match(full_pattern_with_minutes, datetime_range):
        print("full_pattern_with_minutes")
        format = "%a, %b %d, %I:%M %p"
        start_str, end_str = re.match(full_pattern_with_minutes, datetime_range).groups()
        start_dt = datetime.strptime(start_str, format)
        end_dt = datetime.strptime(end_str, format)
    elif re.match(full_pattern_without_minutes, datetime_range):
        print("full_pattern_without_minutes")
        format = "%a, %b %d, %I %p"
        start_str, end_str = re.match(full_pattern_without_minutes, datetime_range).groups()
        start_dt = datetime.strptime(start_str, format)
        end_dt = datetime.strptime(end_str, format)
    elif re.match(same_day_pattern_with_minutes, datetime_range):
        print("same_day_pattern_with_minutes")
        original_tuple = re.match(same_day_pattern_with_minutes, datetime_range).groups()
        modified_tuple = tuple(original_tuple[0].split(', ')[:-1] + original_tuple[0].split(', ')[-1].split(' ') + list(original_tuple[1:]))
        start_str = f"{modified_tuple[0]}, {modified_tuple[1]}, {modified_tuple[2]} {modified_tuple[3]}"
        end_str = f"{modified_tuple[0]}, {modified_tuple[1]}, {modified_tuple[4]}"
        format = "%a, %b %d, %I:%M %p"
        start_dt = datetime.strptime(start_str, format)
        end_dt = datetime.strptime(end_str, format)
        
    elif re.match(same_day_pattern_without_minutes, datetime_range):
        print("same_day_pattern_without_minutes")
        original_tuple = re.match(same_day_pattern_without_minutes, datetime_range).groups()
        modified_tuple = tuple(original_tuple[0].split(', ')[:-1] + original_tuple[0].split(', ')[-1].split(' ') + list(original_tuple[1:]))
        start_str = f"{modified_tuple[0]}, {modified_tuple[1]}, {modified_tuple[2]} {modified_tuple[4]}"
        end_str = f"{modified_tuple[0]}, {modified_tuple[1]}, {modified_tuple[3]} {modified_tuple[4]}"
        format = "%a, %b %d, %I %p"
        start_dt = datetime.strptime(start_str, format)
        end_dt = datetime.strptime(end_str, format)
        
    elif re.match(all_day_pattern, datetime_range):
        print("all_day_pattern")
        start_date_str, end_date_str = re.match(all_day_pattern, datetime_range).groups()
        start_dt = datetime.strptime(start_date_str, "%a, %b %d").replace(hour=0, minute=0)
        end_dt = datetime.strptime(end_date_str, "%a, %b %d").replace(hour=23, minute=59)
        
    else:
        # Handle unexpected format or log an error
        print("no expression matched")
        start_dt, end_dt = None, None
    
    # For formats with explicit start and end datetimes
    if isinstance(start_dt, datetime):
        start_dt = start_dt.replace(year=datetime.now().year)
        end_dt = end_dt.replace(year=datetime.now().year)
    
    return start_dt, end_dt


  def fetch_events_for_event_type(self):
    start = 0
    proceed = True

    try:
      for i in range(1, 2):
          
        data = []
        url = self.row['source_url'].format(
          event_type=self.source_event_type,
          city_code=self.city_code,
          state_code=self.state_code,
          country_code=self.country_code,
          date=self.date,
          start=i*10
        )

        response = requests.get(url, headers=self.request_headers)
        if response.status_code == 200:
          
          response_json = json.loads(response.content.decode())
          events = response_json['eventsResults']
          
          if len(events) == 0:
            break
          
          for event in events:
            with open("output.json", "w") as f:
              json.dump(event, f)
            
            
            start_datetime, end_datetime = self.parse_datetime_range(datetime_range=event['date']['when'])
            
              
            event_address_street_no = event['address'][0].split(",")[-1].strip()
            event_address = ', '.join([event_address_street_no, event['address'][1]])
            apt_number_pattern = r" \#\d+"
            event_address = re.sub(apt_number_pattern, "", event_address)
            
            try:
              lat_lon = self.helper_functions.get_lat_lon_from_address(event_address)
              if lat_lon is None:
                continue
              lat = lat_lon['lat']
              lon = lat_lon['lng']
              
              
              formatted_timezone = self.helper_functions.get_timezone_from_lat_lng(latitude=lat, longitude=lon)
              starttime_utc = self.helper_functions.convert_to_utc(datetime_obj=start_datetime, timezone_str=formatted_timezone)
              starttime_utc_str = starttime_utc.strftime(DATETIME_FORMAT)
              
              endtime_utc = self.helper_functions.convert_to_utc(datetime_obj=end_datetime, timezone_str=formatted_timezone)
              endtime_utc_str = endtime_utc.strftime(DATETIME_FORMAT)

              event_data = {
                'UUID': str(uuid4()),
                'Source': self.source,
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
        
        df_new = pd.DataFrame(data)
        self.df = pd.concat([self.df, df_new], ignore_index=True)
      
      for i, row in self.df.iterrows():
        self.__load_event(event_data=row.to_dict())
            
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
    