#! /usr/bin/python3.8
import os, sys, random, json
from uuid import uuid4

import pandas as pd

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

# sys.path.append('../../db')
from db.db_handler import Neo4jDB
from db import queries
from create_test_data import CreateTestData
from utils.logger import Logger
from utils.helper_functions import hash_password

class FacebookDataLoader:
    def __init__(self):
        self.__facebook_events_dir = os.path.join(os.environ['STONKS_APP_HOME'], 'Testing', 'data', 'facebook_events', 'event_data_json')
        # self.enriched_data_folder_path = os.path.join(self.data_folder_path, 'csv', 'enriched')
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)
    
    def __load_event(self, event_file_path):
        with open(event_file_path, 'r') as f:
            event_data = json.load(f)
        event_data['UUID'] = str(uuid4())
        event_type_uuid = self.neo4j.execute_query_with_params(query=queries.MERGE_EVENT_TYPE_NODE, params={'event_type' : event_data['EventType']})[0]['EventTypeUUID']

        del event_data['EventType']
        event_data['EventTypeUUID'] = event_type_uuid
        
        
        self.neo4j.execute_query_with_params(query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data)
        

    

    def run(self):
        location_folders = os.listdir(self.__facebook_events_dir)
        for location_folder in location_folders:
            date_folders = os.listdir(os.path.join(self.__facebook_events_dir, location_folder))
            for date_folder in date_folders:
                print("Loading events for location: {}, date: {}".format(location_folder, date_folder))
                for event_file in os.listdir(os.path.join(self.__facebook_events_dir, location_folder, date_folder, 'success')):
                    print("Loading event: {}".format(event_file))
                    self.__load_event(os.path.join(self.__facebook_events_dir, location_folder, date_folder, 'success', event_file))
                print("Done loading events for location: {}, date: {}".format(location_folder, date_folder))

if __name__ == "__main__":
    FacebookDataLoader().run()