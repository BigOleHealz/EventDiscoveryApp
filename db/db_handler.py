import os, traceback
from typing import Mapping

from py2neo import Graph, Node, Relationship
from db import queries

class Neo4jDB:
    def __init__(self):
        # Connection string for the Neo4j database
        self.cxn_string = "bolt://100.26.167.168:7687"
        self.graph = Graph(self.cxn_string, auth=("neo4j", os.environ.get('NEO4J_PASSWORD')))

    def run_command(self, command: str):
        return self.graph.run(command)
    
    def execute_query(self, query: str):
        result = self.run_command(query)
        result = [rec for rec in result]
        
        return result
        
    def __create_node(self, node_labels: Mapping[str, list], properties: dict=None):
        if properties is None:
            properties = {}
        if isinstance(node_labels, str):
            node = Node(node_labels, **properties)
        elif isinstance(node_labels, list):
            node = Node(*node_labels, **properties)
        else:
            raise TypeError(f'Argument "node_labels" must be of type str or list but received type: {type(node_labels)}')
        self.graph.create(node)
        
        return node
    
    def get_node_by_id(self, node_id: int):
        result = self.execute_query(queries.GET_NODE_BY_ID.format(node_id=node_id))
        if len(result) == 0:
            raise ValueError(f'Could not find node with id = {node_id}')
        node = result[0]['n']
        return node

    def get_event_type_node_by_event_type_id(self, event_type_id: int):
        result = self.execute_query(queries.GET_EVENT_TYPE_BY_ID.format(event_type_id=event_type_id))
        if len(result) == 0:
            raise ValueError(f'Could not find EventType node with EventTypeID = {event_type_id}')
        node = result[0]['n']
        return node

    def create_relationship(self, a_node: Node, relationship_label: str, b_node: Node, properties: dict=None):
        if properties is None:
            properties = {}
        relationship = Relationship(a_node, relationship_label, b_node)
        relationship.update(properties)
        self.graph.create(relationship)
    
    def create_event_node(self, properties: dict=None):
        node = self.__create_node(node_labels='Event', properties=properties)
        return node
    
    def create_business_node(self, properties: dict=None):
        node = self.__create_node(node_labels=['Account', 'Business'], properties=properties)
        return node
    
    def create_event_type_node(self, properties: dict=None):
        node = self.__create_node(node_labels='EventType', properties=properties)
        return node
    
    def create_person_node(self, properties: dict=None):
        node = self.__create_node(node_labels=['Account', 'Person'], properties=properties)
        return node
    
    def delete_node_by_id(self, node_id: int):
        self.run_command(queries.DELETE_NODE_BY_ID.format(node_id=node_id))
        
    def load_event(self, created_by_id: int, properties: dict, friends_invited: list=None):
        event_node = None
        tx = self.graph.begin()
        try:
            person_node = self.get_node_by_id(node_id=created_by_id)
            event_node = self.create_event_node(properties=properties)
            self.create_relationship(a_node=person_node, relationship_label='CREATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='CREATED_BY', b_node=person_node)
            
            event_type_node = self.get_event_type_node_by_event_type_id(event_type_id=properties['EventTypeID'])
            self.create_relationship(a_node=event_type_node, relationship_label='RELATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='EVENT_TYPE', b_node=event_type_node)
            
            invite_properties = {'INVITED_BY_ID' : created_by_id, 'INVITED_DATE': properties['EventCreatedAt']}
            for invitee_id in eval(friends_invited):
                invitee_node = self.get_node_by_id(node_id=invitee_id)
                self.create_relationship(a_node=invitee_node, relationship_label='INVITED', b_node=event_node, properties=invite_properties)
            tx.commit()
            
        except Exception as error:
            print(traceback.format_exc())
            tx.rollback()
            raise error
    
    def create_attending_relationship(self, attendee_node: Node, event_node: Node):
        try:
            self.create_relationship(a_node=attendee_node, relationship_label='ATTENDING', b_node=event_node)
        except:
            raise Exception(f'Could not created ATTENDING relationship between person_node: {attendee_node=} ->{event_node=}')
