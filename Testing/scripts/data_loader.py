import os, sys, random
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


class DataLoader:
    def __init__(self):
        self.data_folder_path = os.path.join(os.environ['STONKS_APP_HOME'], 'Testing', 'data')
        self.enriched_data_folder_path = os.path.join(self.data_folder_path, 'csv', 'enriched')
        self.logger = Logger(__name__)
        self.neo4j = Neo4jDB(logger=self.logger)
    
    def wipe_data(self):
        self.logger.emit("Wiping Data")
        self.neo4j.run_command(queries.DELETE_ALL_NODES)
        
    def wipe_events(self):
        self.logger.emit("Wiping Events")
        self.neo4j.run_command(queries.DELETE_ALL_NODES_BY_LABEL.format(label='Event'))
    
    def load_event_types_to_neo4j_db(self):
        self.logger.emit('Loading Event Types')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'event_types.csv'))
        df['UUID'] = df['UUID'].apply(lambda x: str(uuid4()) if pd.isna(x) else x)
        for _, row in df.iterrows():
            self.neo4j.create_event_type_node(properties=row.to_dict())

    def load_businesses_to_neo4j_db(self):
        self.logger.emit('Loading Businesses')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'businesses.csv'))
        df['UUID'] = df['UUID'].apply(lambda x: str(uuid4()) if pd.isna(x) else x)
        for _, row in df.iterrows():
            self.neo4j.create_business_node(properties=row.to_dict())
    
    def load_persons_to_neo4j_db(self):
        self.logger.emit('Loading Persons')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'persons.csv'))
        df['UUID'] = df['UUID'].apply(lambda x: str(uuid4()) if pd.isna(x) else x)
        person_properties_list = ['FirstName','LastName','Username','Email', 'UUID']
        for _, row in df[person_properties_list].iterrows():
            self.neo4j.create_person_node(properties=row.to_dict(), password=row['Email'].split('@')[0])
            
        for _, row in df[['Email', 'Interests','Friends']].iterrows():
            person_node = self.neo4j.graph.nodes.match("Person", Email=row['Email']).first()
            self.neo4j.run_command(queries.CREATE_ACCOUNT_INTERESTED_IN_RELATIONSHIPS_BY_MANUALLY_ASSIGNED_ID.format(
                                                account_id=person_node.identity, interest_id_list=eval(row['Interests'])))
            
            for friend_email in eval(row['Friends']):
                friend_node = self.neo4j.graph.nodes.match("Person", Email=friend_email).first()
                
                # Create Friend request if the friend has not already sent the person a request
                if not self.neo4j.graph.match((friend_node, person_node), r_type='FRIEND_REQUEST').first():
                    self.neo4j.create_friend_request(node_a=person_node, node_b=friend_node)

        for person_node in self.neo4j.graph.nodes.match("Person"):
            friend_requests = self.neo4j.get_pending_friend_requests(person_node=person_node)
            for friend_request in friend_requests:
                record = friend_request['RELATIONSHIP']
                self.neo4j.accept_friend_request(node_a=person_node, node_b=record.start_node, friend_request_uuid=record['UUID'])
                
    
    def load_events_to_neo4j_db(self):
        self.logger.emit('Loading Events')
        df = pd.read_csv(os.path.join(self.enriched_data_folder_path, 'events.csv'))

        property_label_list = ['CreatedByUUID', 'Lat', 'Lon', 'StartTimestamp', 'EndTimestamp', 'PublicEventFlag', 'EventTypeUUID', 'EventCreatedAt', 'EventName', "Host", "Address"]
        df['UUID'] = df.apply(lambda x: str(uuid4()))
        
        for _, row in df.iterrows():
            properties = row[property_label_list].to_dict()
            
            creator_node = self.neo4j.get_node(UUID=properties['CreatedByUUID'])
            self.neo4j.create_event_with_relationships(creator_node=creator_node, properties=properties, friends_invited=eval(row['InviteList']))
            
    def load_attending_relationships(self):
        self.logger.emit('Loading Attending Relationships')
        persons = self.neo4j.execute_query(queries.GET_ALL_NODES_BY_LABEL.format(label='Person'))
        
        invited_flags = [True, False, False]
        for person in persons:
            person_node = person['n']
            email = person_node['Email']
            invited_events = self.neo4j.execute_query(queries.GET_ALL_EVENT_INVITED.format(email=email))

            for event_rec in invited_events:
                event_node = event_rec['e']
                invite_relationship = self.neo4j.get_relationship_by_nodes_and_label(node_a=person_node, relationship_label='INVITED', node_b=event_node)
                if invite_relationship:
                    if random.choice(invited_flags) is True:
                        
                        self.neo4j.accept_event_invite(event_invite_uuid=invite_relationship['UUID'])
                    else:
                        if random.choice([False, True]):
                            self.neo4j.decline_event_invite(event_invite_uuid=invite_relationship['UUID'])


if __name__ == '__main__':
    dl = DataLoader()
    
    dl.wipe_data()
    dl.load_event_types_to_neo4j_db()
    dl.load_persons_to_neo4j_db()
    dl.load_businesses_to_neo4j_db()
    
    dl.wipe_events()
    ctd = CreateTestData()
    ctd.create_events_csv()
    dl.load_events_to_neo4j_db()
    dl.load_attending_relationships()
