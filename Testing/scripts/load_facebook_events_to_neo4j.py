#! /usr/bin/python3.8
import os, sys, json
from uuid import uuid4

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger


class FacebookDataLoader:
    def __init__(self):
        self.facebook_events_dir = os.path.join(os.environ["STONKS_APP_HOME"], "Testing", "data", "facebook_events", "event_data_json")
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)

    def __load_event(self, event_file_path):
        with open(event_file_path, "r") as f:
            event_data = json.load(f)
        
        params = {
            "uuid": str(uuid4()),
            "event_type": event_data["EventType"]
        }
        event_type_uuid = self.neo4j.execute_query_with_params(
            query=queries.MERGE_EVENT_TYPE_NODE,
            params=params,
        )[0]["EventTypeUUID"]

        event_data["UUID"] = str(uuid4())
        del event_data["EventType"]
        event_data["EventTypeUUID"] = event_type_uuid

        self.neo4j.execute_query_with_params(
            query=queries.CREATE_EVENT_IF_NOT_EXISTS, params=event_data
        )

    def run(self):
        location_folders = os.listdir(self.facebook_events_dir)
        for location_folder in location_folders:
            date_folders = os.listdir(
                os.path.join(self.facebook_events_dir, location_folder)
            )
            for date_folder in date_folders:
                print("Loading events for location: {}, date: {}".format(location_folder, date_folder))
                for event_file in os.listdir(
                    os.path.join(self.facebook_events_dir, location_folder, date_folder, "success")):
                    print("Loading event: {}".format(event_file))
                    self.__load_event(os.path.join(self.facebook_events_dir, location_folder, date_folder, "success", event_file))
                print("Done loading events for location: {}, date: {}".format(location_folder, date_folder))


if __name__ == "__main__":
    FacebookDataLoader().run()
