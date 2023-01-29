import os, sys

import pandas as pd

sys.path.append('../../db')
from db_handler import Neo4jDB

class DataLoader:
    def __init__(self):
        self.__data_folder_path = os.path.join(os.getcwd(), '..', 'data')
        self.__enriched_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'enriched')
        self.__neo4j = Neo4jDB()
    
    def wipe_data(self):
        self.__neo4j.run_command('MATCH (n) DETACH DELETE n;')
    
    def load_businesses_to_neo4j_db(self):
        df = pd.read_csv(os.path.join(self.__enriched_data_folder_path, 'businesses.csv'))
        for _, row in df.iterrows():
            self.__neo4j.create_node(node_type='Business', properties=row.to_dict())
    
    def load_event_types_to_neo4j_db(self):
        df = pd.read_csv(os.path.join(self.__enriched_data_folder_path, 'event_types.csv'))
        for _, row in df.iterrows():
            self.__neo4j.create_node(node_type='EventType', properties=row.to_dict())
    
    def load_users_to_neo4j_db(self):
        df = pd.read_csv(os.path.join(self.__enriched_data_folder_path, 'users.csv'))
        for _, row in df[['AccountID','Name','Email']].iterrows():
            self.__neo4j.create_node(node_type='User', properties=row[['AccountID','Name','Email']].to_dict())
            
        for _, row in df[['AccountID', 'Interests','Friends']].iterrows():
            
            for interest_id in eval(row['Interests']):
                user_node = self.__neo4j.graph.nodes.match("User", AccountID=row['AccountID']).first()
                interest_node = self.__neo4j.graph.nodes.match("EventType", EventTypeID=interest_id).first()
                self.__neo4j.create_relationship(a_node=user_node, relationship_label='INTERESTED_IN', b_node=interest_node)
            
            for friend_id in eval(row['Friends']):
                user_node = self.__neo4j.graph.nodes.match("User", AccountID=row['AccountID']).first()
                interest_node = self.__neo4j.graph.nodes.match("User", AccountID=friend_id).first()
                self.__neo4j.create_relationship(a_node=user_node, relationship_label='FRIENDS_WITH', b_node=interest_node)


if __name__ == '__main__':
    dl = DataLoader()
    
    dl.wipe_data()
    dl.load_businesses_to_neo4j_db()
    dl.load_event_types_to_neo4j_db()
    dl.load_users_to_neo4j_db()