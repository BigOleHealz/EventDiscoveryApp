#! /usr/bin/python3.8
import os, sys, json, traceback
from uuid import uuid4

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger


class EventBriteDataLoader:
    def __init__(self):
        self.eventbrite_events_dir = os.getcwd()
        self.event_data_json_folder = os.path.join(self.eventbrite_events_dir, "event_data_json")
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)

    def __load_event(self, event_file_path):
        with open(event_file_path, "r") as f:
            event_data = json.load(f)
        
        event_query_response = self.neo4j.execute_query_with_params(
            query=queries.CHECK_IF_EVENT_EXISTS, params=event_data
        )
        if len(event_query_response) == 0:
            self.neo4j.execute_query_with_params(
                query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data
            )
        
        # params = {
        #     "uuid": str(uuid4()),
        #     "event_type": event_data["EventType"]
        # }
        # event_type_uuid = self.neo4j.execute_query_with_params(
        #     query=queries.MERGE_EVENT_TYPE_NODE,
        #     params=params,
        # )[0]["EventTypeUUID"]

        # event_data["UUID"] = str(uuid4())
        # del event_data["EventType"]
        # event_data["EventTypeUUID"] = event_type_uuid

        # self.neo4j.execute_query_with_params(
        #     query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data
        # )

    def run(self):
        location_folders = os.listdir(self.event_data_json_folder)
        for location_folder in location_folders:

            location_folder_full_path = os.path.join(self.event_data_json_folder, location_folder)
            date_folders = os.listdir(location_folder_full_path)
            
            for date_folder in date_folders:
                print("Loading events for location: {}, date: {}".format(location_folder, date_folder))

                full_path_location_date = os.path.join(location_folder_full_path, date_folder)
                for page_no in os.listdir(full_path_location_date):

                    success_matched_folder_full_path = os.path.join(location_folder_full_path, date_folder, page_no, "success", "matched")
                    for event_file in os.listdir(success_matched_folder_full_path):
                        print("Loading event: {}".format(event_file))

                        try:
                            self.__load_event(os.path.join(success_matched_folder_full_path, event_file))
                        except Exception as e:
                            print("Error loading event: {}".format(event_file))
                            print(e)
                            print(traceback.format_exc())
                            continue

                print("Done loading events for location: {}, date: {}".format(location_folder, date_folder))


if __name__ == "__main__":
    EventBriteDataLoader().run()
