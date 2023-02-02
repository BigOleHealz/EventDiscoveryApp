#!/usr/bin/python3

import os, sys

import pandas as pd

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
home = os.path.dirname(parent)
sys.path.append(home)

# sys.path.append('../../db')
from db.db_handler import Neo4jDB
from db import queries
from create_test_data import CreateTestData


class DataLoader:
    def __init__(self):
        self.data_folder_path = os.path.join('/home/bigolehealz/workspace/EventApp/Testing/data')
        self.enriched_data_folder_path = os.path.join(self.data_folder_path, 'csv', 'enriched')
        self.neo4j = Neo4jDB()
    
    def wipe_data(self):
        self.neo4j.run_command('MATCH (n) DETACH DELETE n;')
        
    def wipe_events(self):
        self.neo4j.run_command(queries.DELETE_ALL_EVENTS)
    
    def load_event_types_to_neo4j_db(self):
        print('Loading Event Types')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'event_types.csv'))
        for _, row in df.iterrows():
            self.neo4j.create_event_type_node(properties=row.to_dict())

    def load_businesses_to_neo4j_db(self):
        print('Loading Businesses')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'businesses.csv'))
        for _, row in df.iterrows():
            self.neo4j.create_business_node(properties=row.to_dict())
    
    def load_users_to_neo4j_db(self):
        print('Loading Users')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'users.csv'))
        user_properties_list = ['AccountID','Name','Email']
        for _, row in df[user_properties_list].iterrows():
            self.neo4j.create_user_node(properties=row[user_properties_list].to_dict())
            
        for _, row in df[['AccountID', 'Interests','Friends']].iterrows():
            user_node = self.neo4j.graph.nodes.match("User", AccountID=row['AccountID']).first()
            
            for interest_id in eval(row['Interests']):
                
                interest_node = self.neo4j.graph.nodes.match("EventType", EventTypeID=interest_id).first()
                self.neo4j.create_relationship(a_node=user_node, relationship_label='INTERESTED_IN', b_node=interest_node)
            
            for friend_id in eval(row['Friends']):
                friend_node = self.neo4j.graph.nodes.match("User", AccountID=friend_id).first()
                self.neo4j.create_relationship(a_node=user_node, relationship_label='FRIENDS_WITH', b_node=friend_node)
                
    
    def load_events_to_neo4j_db(self):
        print('Loading Events')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'events.csv'))
        property_label_list = ['CreatedByID', 'Lat', 'Lon', 'StartTimestamp', 'EndTimestamp', 'PublicEventFlag', 'EventTypeID', 'EventCreatedAt', 'EventName']
        
        for _, row in df.iterrows():
            properties = row[property_label_list].to_dict()
            self.neo4j.load_event(created_by_id=row['CreatedByID'], properties=properties, friends_invited=row['InviteList'])
            

if __name__ == '__main__':
    dl = DataLoader()
    
    # dl.wipe_events()
    dl.wipe_data()
    dl.load_event_types_to_neo4j_db()
    dl.load_users_to_neo4j_db()
    dl.load_businesses_to_neo4j_db()
    
    ctd = CreateTestData()
    ctd.create_events_csv()
    dl.load_events_to_neo4j_db()
