#!/usr/bin/python3

import random, os, requests, sys, traceback
from uuid import uuid4
from datetime import datetime as dt, timedelta
import pandas as pd


from dotenv import load_dotenv

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger
from utils.helper_functions import HelperFunctions
from utils.constants import CITY_DATA, datetime_format


load_dotenv()


min_date = dt.today().date()
max_date = min_date + timedelta(days=14)
max_num_events = 50
decimal_precision = 7

PUBLIC_EVENT_FLAG_LIST = [True, False]


class CreateTestData:
    def __init__(self, logger: Logger=None):
        self.__home_dir = os.environ['STONKS_APP_HOME']
        self.__data_folder_path = os.path.join(self.__home_dir, 'Testing', 'data')
        self.__raw_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'raw')
        self.__enriched_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'enriched')
        
        if logger is None:
            logger = Logger(__name__)
        self.logger = logger
        self.neo4j = Neo4jDB(logger=self.logger)
        self.helper_functions = HelperFunctions(logger=self.logger)
        
        self.google_maps_api_key = os.getenv('GOOGLE_MAPS_API_KEY')
        
    

    def create_enriched_locations_data_csv(self):
        input_fule = os.path.join(self.__raw_data_folder_path, 'business_addresses.csv')
        df = pd.read_csv(input_fule)

        lat_lng = df['Address'].apply(self.helper_functions.get_lat_lon_from_address)

        df['Lat'] = [cell['lat'] for cell in lat_lng]
        df['Lng'] = [cell['lng'] for cell in lat_lng]
        
        df['UUID'] = df['UUID'].apply(lambda x: uuid4() if pd.isna(x) else x)
        
        df.to_csv(os.path.join(self.__enriched_data_folder_path, 'businesses.csv'), index=False)

    def create_events_csv(self):
        df = pd.DataFrame(columns=['CreatedByUUID', 'Lon', 'Lat', 'StartTimestamp', 'EndTimestamp', 'PublicEventFlag', 'InviteList'])
        
        person_uuids = [rec['UUID'] for rec in self.neo4j.run_command(queries.GET_ALL_NODE_UUIDS_BY_LABEL.format(label='Person'))]
        account_uuids = [rec['UUID'] for rec in self.neo4j.run_command(queries.GET_ALL_NODE_UUIDS_BY_LABEL.format(label='Account'))]
        event_type_uuids = [rec['UUID'] for rec in self.neo4j.run_command(queries.GET_ALL_NODE_UUIDS_BY_LABEL.format(label='EventType'))]
        
        for date in pd.date_range(min_date, max_date, freq='d'):
            print(date)
            for _ in range(random.randint(1, max_num_events)):
                event_type_uuid = random.choice(event_type_uuids)
                created_by_uuid = random.choice(account_uuids)
                
                start_ts = date + timedelta(hours=random.randint(0, 23))
                end_ts = start_ts + timedelta(hours=random.randint(0, 23))
                public_event_flag = random.choice(PUBLIC_EVENT_FLAG_LIST)
                
                event_creator_node = self.neo4j.get_node(UUID=created_by_uuid)
                
                if created_by_uuid in person_uuids:
                    friends_list = [rec['UUID'] for rec in self.neo4j.execute_query(queries.GET_PERSON_FRIENDS_UUID_NAME_MAPPINGS_BY_EMAIL.format(email=event_creator_node['Email']))]
                    invite_list = random.sample(friends_list, random.randint(0, len(friends_list)))
                    lat = round(random.uniform(CITY_DATA['Philadelphia']['Lat']['min'], CITY_DATA['Philadelphia']['Lat']['max']), decimal_precision)
                    lon = round(random.uniform(CITY_DATA['Philadelphia']['Lon']['min'], CITY_DATA['Philadelphia']['Lon']['max']), decimal_precision)
                    
                    address = self.helper_functions.get_address_from_lat_lon(lat=lat, lon=lon)
                    creator_name = event_creator_node.get('Username')
                else:
                    invite_list = []
                    lon = event_creator_node.get('Lng')
                    lat = event_creator_node.get('Lat')
                    address = event_creator_node.get('Address')
                    creator_name = event_creator_node.get('Title')
                    
                params = {'Address' : address, 'Host' : creator_name}
                
                row = {
                        'CreatedByUUID' : created_by_uuid,
                        'EventTypeUUID' : event_type_uuid,
                        'Lon' : lon,
                        'Lat' : lat,
                        'StartTimestamp' : start_ts,
                        'EndTimestamp' : end_ts,
                        'PublicEventFlag': public_event_flag,
                        'InviteList' : invite_list,
                        **params
                    }
                df = pd.concat([df, pd.Series(row).to_frame().T])
        dummy_event_df = pd.DataFrame({'CreatedByUUID' : 'ae36de82-eee0-4a45-b332-afcdd30685ac', 'Lon' : 39.9517163, 'Lat' : -75.161202, 'StartTimestamp' : dt.today(), 'EndTimestamp' : dt.today() + timedelta(hours=3), 'PublicEventFlag': True, 'InviteList' : []})
        df = pd.concat([df, dummy_event_df])
        
        df["EventCreatedAt"] = df.apply(lambda x: x["StartTimestamp"] - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23), minutes=random.randint(0, 59)), axis=1)

        df['StartTimestamp'] = df['StartTimestamp'].apply(lambda x: x.strftime(datetime_format))
        df['EndTimestamp'] = df['EndTimestamp'].apply(lambda x: x.strftime(datetime_format))
        df["EventCreatedAt"] = df["EventCreatedAt"].apply(lambda x: x.strftime(datetime_format))
        
        len_df = len(df)
        print(f'{len_df}')
        event_name_list = []
        for i in range(len(df)):
            event_name_list.append(rw.get_random_word())
            print(f'{i}: {100 * i / len_df}')

        df['EventName'] = event_name_list
        
        df.to_csv(os.path.join(self.__home_dir, 'Testing', 'data', 'csv', 'enriched', 'events.csv'), index=False)
        

if __name__ == '__main__':
    ctd = CreateTestData()
    ctd.create_enriched_locations_data_csv()
    ctd.create_events_csv()
