import os, traceback, sys
from datetime import datetime
from typing import Mapping

from py2neo import Graph, Node, Relationship
from db import queries
from utils.constants import datetime_format
from utils.logger import Logger
from utils.aws_handler import AWSHandler
from utils.helper_functions import hash_password

class Neo4jDB:
    def __init__(self, logger: Logger):
        self.logger = logger
        
        # Connection string for the Neo4j database
        aws_handler = AWSHandler(logger=self.logger)
        neo4j_secrets = aws_handler.get_secret('neo4j_credentials')
        
        self.graph = Graph(neo4j_secrets['CONNECTION_STRING'],
                           auth=(neo4j_secrets['USER'],
                                 neo4j_secrets['PASSWORD']
                            ))
        self.logger.info("Successfully connected to Neo4j DB")
    
    def run_command(self, command: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}:\n{command}')
        return self.graph.run(command)
    
    def execute_query(self, query: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}:\n{query}')
        result = self.run_command(query)
        result = [rec for rec in result]
        
        return result
    
    def __create_node(self, node_labels: Mapping[str, list], properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
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
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        result = self.execute_query(queries.GET_NODE_BY_ID.format(node_id=node_id))
        if len(result) == 0:
            raise ValueError(f'Could not find node with id = {node_id}')
        node = result[0]['n']
        return node
    
    def get_account_node_by_email(self, email: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_EMAIL.format(email=email))
        if len(result) == 1:
            return result[0]['n']
        elif len(result) == 0:
            raise Exception(f"No Account found with email address: {email}")
        else:
            raise Exception(f"Multiple Accounts found with email address: {email}")

    def get_event_type_node_by_event_type_id(self, event_type_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        result = self.execute_query(queries.GET_EVENT_TYPE_BY_EVENTTYPEID.format(event_type_id=event_type_id))
        if len(result) == 0:
            raise ValueError(f'Could not find EventType node with EventTypeID = {event_type_id}')
        node = result[0]['n']
        return node

    def create_relationship(self, a_node: Node, relationship_label: str, b_node: Node, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if properties is None:
            properties = {}
        relationship = Relationship(a_node, relationship_label, b_node)
        relationship.update(properties)
        self.graph.create(relationship)
    
    def create_event_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels='Event', properties=properties)
        return node
    
    def create_business_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels=['Account', 'Business'], properties=properties)
        return node
    
    def create_event_type_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels='EventType', properties=properties)
        return node
    
    def create_person_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels=['Account', 'Person'], properties=properties)
        return node
    
    def delete_node_by_id(self, node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        self.run_command(queries.DELETE_NODE_BY_ID.format(node_id=node_id))
    
    def create_event_with_relationships(self, creator_node: Node=None, properties: dict=None, friends_invited: list=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        event_node = None
        tx = self.graph.begin()
        try:
            event_node = self.create_event_node(properties=properties)
            self.create_relationship(a_node=creator_node, relationship_label='CREATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='CREATED_BY', b_node=creator_node)
            
            event_type_node = self.get_event_type_node_by_event_type_id(event_type_id=properties['EventTypeID'])
            self.create_relationship(a_node=event_type_node, relationship_label='RELATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='EVENT_TYPE', b_node=event_type_node)
            
            invite_properties = {'INVITED_BY_ID' : creator_node.identity, 'INVITED_DATE': datetime.now().strftime(datetime_format)}
            
            for invitee_id in friends_invited:
                invitee_node = self.get_node_by_id(node_id=invitee_id)
                self.create_relationship(a_node=invitee_node, relationship_label='INVITED', b_node=event_node, properties=invite_properties)
            tx.commit()
            return event_node
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            print(traceback.format_exc())
            tx.rollback()
            raise error
    
    def backload_event(self, created_by_id: int=None, creator_node: Node=None, properties: dict=None, friends_invited: list=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        event_node = None
        tx = self.graph.begin()
        try:
            creator_node = self.get_node_by_id(node_id=created_by_id)
            event_node = self.create_event_node(properties=properties)
            self.create_relationship(a_node=creator_node, relationship_label='CREATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='CREATED_BY', b_node=creator_node)
            
            event_type_node = self.get_event_type_node_by_event_type_id(event_type_id=properties['EventTypeID'])
            self.create_relationship(a_node=event_type_node, relationship_label='RELATED_EVENT', b_node=event_node)
            self.create_relationship(a_node=event_node, relationship_label='EVENT_TYPE', b_node=event_type_node)
            
            invite_properties = {'INVITED_BY_ID' : created_by_id, 'INVITED_DATE': properties['EventCreatedAt']}
            for invitee_id in eval(friends_invited):
                invitee_node = self.get_node_by_id(node_id=invitee_id)
                self.create_relationship(a_node=invitee_node, relationship_label='INVITED', b_node=event_node, properties=invite_properties)
            tx.commit()
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            tx.rollback()
            raise error
    
    def create_attending_relationship(self, attendee_node: Node, event_node: Node):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        ### Make this function so that it can take attendee nodes or IDs
        try:
            self.create_relationship(a_node=attendee_node, relationship_label='ATTENDING', b_node=event_node)
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not created ATTENDING relationship between person_node: {attendee_node} ->{event_node}')


    def delete_attending_relationship(self, attendee_node_id: int, event_node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        try:
            self.run_command(queries.DELETE_ATTENDING_RELATIONSHIP_BY_NODES_IDS.format(person_id=attendee_node_id, event_id=event_node_id))
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not delete ATTENDING relationship between person_node: {attendee_node_id} ->{event_node_id}')


    def create_attending_relationship_by_id(self, attendee_node_id: int, event_node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        try:
            self.run_command(queries.CREATE_ATTENDING_RELATIONSHIP_BY_NODES_IDS.format(person_id=attendee_node_id, event_id=event_node_id))
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not create ATTENDING relationship between person_node: {attendee_node_id} ->{event_node_id}')

    def authenticate_account(self, email: str, password: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        password_hash = hash_password(input_string=password)
        response = self.execute_query(queries.AUTHENTICATE_ACCOUNT_EMAIL_AND_PASSWORD.format(email=email, password_hash=password_hash))
        if len(response) == 0:
            self.logger.info(f'No account with that email-password_hash combination:\n{email=}\n{password_hash=}')
            return response, 'No account with that email-password combination'
        elif len(response) == 1:
            self.logger.info(f'Account Authenticated: {email=}')
            return response[0]['n'], 'Success'
        elif len(response) > 1:
            self.logger.info(f'Multiple accounts exist with that email-password_hash combination:\n{email=}\n{password_hash=}')
            return response, 'Multiple accounts exist with that email-password combination'
        else:
            error_string = f"len(response) is not an int: {type(len(response))=}"
            self.logger.error(error_string)        
            raise ValueError(error_string)
