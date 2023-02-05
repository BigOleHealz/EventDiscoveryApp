#!/usr/bin/python3

import random, os, requests, sys
from datetime import datetime as dt, timedelta
import pandas as pd

from random_word import RandomWords
rw = RandomWords()

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries

city_data = {
    'Philadelphia' : {
        'lon' : {
            'min' : -75.222864,
            'max' : -75.141320
        },
        'lat' : {
            'min' : 39.905712,
            'max' : 39.977753
        }
    }
}


min_date = dt.today().date()
max_date = min_date + timedelta(days=7)
max_num_events = 25
decimal_precision = 7

PUBLIC_EVENT_FLAG_LIST = [True, False]


class CreateTestData:
    def __init__(self):
        self.__data_folder_path = os.path.join(os.getcwd(), '..', 'data')
        self.__raw_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'raw')
        self.__enriched_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'enriched')
        self.neo4j = Neo4jDB()
    
    @staticmethod
    def __lat_lon_from_address(address: str):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={os.environ['GOOGLE_MAPS_API_KEY']}"
        response = requests.get(url)
        resp_json_payload = response.json()
        lat_lon = resp_json_payload['results'][0]['geometry']['location']
        return lat_lon
    
    @staticmethod
    def __address_from_lat_lon(lat: float, lon: float):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={os.environ['GOOGLE_MAPS_API_KEY']}"
        
        response = requests.get(url)
        resp_json_payload = response.json()
        address = resp_json_payload['results'][0]['formatted_address']
            
        return address

    def create_enriched_locations_data_csv(self):
        input_fule = os.path.join(self.__raw_data_folder_path, 'business_addresses.csv')
        df = pd.read_csv(input_fule)

        lat_lng = df['Address'].apply(self.__lat_lon_from_address)

        df['Lat'] = [cell['lat'] for cell in lat_lng]
        df['Lng'] = [cell['lng'] for cell in lat_lng]
        
        df.to_csv(os.path.join(self.__enriched_data_folder_path, 'businesses.csv'), index=False)

    def create_events_csv(self):
        df = pd.DataFrame(columns=['CreatedByID', 'Lon', 'Lat', 'StartTimestamp', 'EndTimestamp', 'PublicEventFlag', 'InviteList'])
        
        person_ids = [rec['_id'] for rec in self.neo4j.run_command(queries.GET_NODE_IDS_FOR_ALL_PERSONS)]
        account_ids = [rec['_id'] for rec in self.neo4j.run_command(queries.GET_NODE_IDS_FOR_ALL_BUSINESSES_AND_PERSONS)]
        event_type_ids = [int(rec['_id']) for rec in self.neo4j.run_command(queries.GET_NODE_IDS_FOR_ALL_EVENT_TYPES)]
        
        for date in pd.date_range(min_date, max_date, freq='d'):
            print(date)
            for _ in range(random.randint(1, max_num_events)):
                event_type_id = random.choice(event_type_ids)
                created_by_id = random.choice(account_ids)
                
                start_ts = date + timedelta(hours=random.randint(0, 23))
                end_ts = start_ts + timedelta(hours=random.randint(0, 23))
                public_event_flag = random.choice(PUBLIC_EVENT_FLAG_LIST)
                
                event_node = self.neo4j.get_node_by_id(node_id=created_by_id)
                
                if created_by_id in person_ids:
                    friends_list = [rec['_id'] for rec in self.neo4j.execute_query(queries.GET_PERSON_FRIENDS_IDS.format(node_id=created_by_id))]
                    invite_list = random.sample(friends_list, random.randint(0, len(friends_list)))
                    lat = round(random.uniform(city_data['Philadelphia']['lat']['min'], city_data['Philadelphia']['lat']['max']), decimal_precision)
                    lon = round(random.uniform(city_data['Philadelphia']['lon']['min'], city_data['Philadelphia']['lon']['max']), decimal_precision)
                    
                    address = self.__address_from_lat_lon(lat=lat, lon=lon)
                    creator_name = event_node.get('Name')
                else:
                    invite_list = []
                    lon = event_node.get('Lng')
                    lat = event_node.get('Lat')
                    address = event_node.get('Address')
                    creator_name = event_node.get('Title')
                    
                params = {'Address' : address, 'Host' : creator_name}
                
                row = {
                        'CreatedByID' : created_by_id,
                        'EventTypeID' : event_type_id,
                        'Lon' : lon,
                        'Lat' : lat,
                        'StartTimestamp' : start_ts,
                        'EndTimestamp' : end_ts,
                        'PublicEventFlag': public_event_flag,
                        'InviteList' : invite_list,
                        **params
                    }
                df = pd.concat([df, pd.Series(row).to_frame().T])

        df["EventCreatedAt"] = df.apply(lambda x: x["StartTimestamp"] - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23), minutes=random.randint(0, 59)), axis=1)

        df['StartTimestamp'] = df['StartTimestamp'].apply(lambda x: x.strftime('%Y-%m-%dT%H:%M:%S'))
        df['EndTimestamp'] = df['EndTimestamp'].apply(lambda x: x.strftime('%Y-%m-%dT%H:%M:%S'))
        df["EventCreatedAt"] = df["EventCreatedAt"].apply(lambda x: x.strftime('%Y-%m-%dT%H:%M:%S'))
        
        len_df = len(df)
        print(f'{len_df=}')
        event_name_list = []
        for i in range(len(df)):
            event_name_list.append(rw.get_random_word())
            print(f'{i}: {100 * i / len_df}')

        df['EventName'] = event_name_list
        df['EventTypeID'] = df['EventTypeID'].astype(int)
        
        df.to_csv(os.path.join(os.getcwd(), '..', 'data', 'csv', 'enriched', 'events.csv'), index=False)
        

if __name__ == '__main__':
    ctd = CreateTestData()
    ctd.create_enriched_locations_data_csv()
    ctd.create_events_csv()
