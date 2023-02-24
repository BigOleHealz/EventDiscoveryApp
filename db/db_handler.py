import os, traceback, sys
from uuid import uuid4
from datetime import datetime
from typing import Mapping, Union

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
    
    def get_account_node(self, node_id: int=None, email: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if all([arg is None for arg in [node_id, email]]):
            raise ValueError(f'{sys._getframe().f_code.co_name} requires either node_id or email arg but received None for both')
        elif node_id:
            result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_ID.format(node_id=node_id))
        elif email:
            result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_EMAIL.format(email=email))
        else:
            self.logger.error(f'Something strange goign on in {sys._getframe().f_code.co_name}')
        
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

    def get_event_type_mappings(self):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        return self.execute_query(queries.GET_EVENT_TYPE_NAMES_MAPPINGS)
    
    def get_account_by_username_or_password(self, email_or_username: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_EMAIL_OR_USERNAME.format(email_or_username=email_or_username))
        if len(result) == 0:
            return None
        else:
            return result[0]['n']
    
    def get_friend_request_sent_or_if_already_friends(self, node_a_id: int, node_b_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        cursor = self.run_command(queries.DETERMINE_IF_FRIEND_REQUESTS_ALREADY_EXISTS_OR_USERS_ALREADY_FRIENDS.format(node_a_id=node_a_id, node_b_id=node_b_id))
        cursor_data = cursor.data()
        if len(cursor_data) == 0:
            return None
        else:
            return cursor_data[0]
    
    def get_pending_friend_requests(self, person_node: Node=None, email: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if person_node is None and email is None:
            raise ValueError(f"Both person_node and email are None. This function requires at least one argument.")
        else:
            if person_node:
                email = person_node['Email']
            friend_requests = self.execute_query(queries.GET_PENDING_FRIEND_REQUESTS.format(email=email))
        
            return friend_requests
    
    def get_pending_event_invites(self, person_node: Node=None, email: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if person_node is None and email is None:
            raise ValueError(f"Both person_node and email are None. This function requires at least one argument.")
        else:
            if person_node:
                email = person_node['Email']
            pending_event_invites = self.execute_query(queries.GET_PENDING_EVENT_INVITES.format(email=email))
        
            return pending_event_invites
    
        
    def get_relationship_by_uuid(self, relationship_label: str, relationship_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        current_timestamp = datetime.now().strftime(datetime_format)
        result = self.execute_query(queries.GET_RELATIONSHIP_BY_UUID.format(relationship_label=relationship_label, uuid=relationship_uuid))
        if len(result) == 0:
            raise ValueError(f"Could not relationship with ID: {relationship_label}")
        else:
            relationship = result[0]['r']
            return relationship
    
    def get_relationship_by_nodes_and_label(self, node_a: Node, relationship_label: str, node_b: Node):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        relationship = self.graph.match((node_a, node_b), r_type=relationship_label).first()
        if len(relationship) == 0:
            raise ValueError(f"No relationship found between {node_a}-[:{relationship_label}]->{node_b}")
        
        return relationship
        

    def create_relationship(self, node_a: Node, relationship_label: str, node_b: Node, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if properties is None:
            properties = {}
        if 'UUID' not in properties:
            properties['UUID'] = str(uuid4())
        relationship = Relationship(node_a, relationship_label, node_b)
        relationship.update(properties)
        self.graph.create(relationship)
    
    def create_event_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels='Event', properties=properties)
        return node
    
    def create_business_node(self, properties: dict=None, password: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if password is None:
            password = ''
        password_hash = hash_password(input_string=password)
        properties['PasswordHash'] = password_hash
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels=['Account', 'Business'], properties=properties)
        return node
    
    def create_event_type_node(self, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels='EventType', properties=properties)
        return node
    
    def create_person_node(self, properties: dict=None, password: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if password is None:
            password = ''
        password_hash = hash_password(input_string=password)
        properties['PasswordHash'] = password_hash
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        node = self.__create_node(node_labels=['Account', 'Person'], properties=properties)
        return node
    
    def delete_node_by_id(self, node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        self.run_command(queries.DELETE_NODE_BY_ID.format(node_id=node_id))
    
    def create_event_with_relationships(self, creator_node: Node=None, properties: dict=None, friends_invited: list=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        event_node = None
        if friends_invited is None:
            friends_invited = []
        tx = self.graph.begin()
        try:
            event_node = self.create_event_node(properties=properties)
            self.create_relationship(node_a=creator_node, relationship_label='CREATED_EVENT', node_b=event_node)
            self.create_relationship(node_a=event_node, relationship_label='CREATED_BY', node_b=creator_node)
            
            event_type_node = self.get_event_type_node_by_event_type_id(event_type_id=properties['EventTypeID'])
            self.create_relationship(node_a=event_type_node, relationship_label='RELATED_EVENT', node_b=event_node)
            self.create_relationship(node_a=event_node, relationship_label='EVENT_TYPE', node_b=event_type_node)
            
            invited_date = properties.get('INVITED_DATE', datetime.now().strftime(datetime_format))
            invite_properties = {'INVITED_BY_ID' : creator_node.identity, 'INVITED_DATE': invited_date, 'STATUS' : 'PENDING'}
            
            for invitee_id in friends_invited:
                invitee_node = self.get_node_by_id(node_id=invitee_id)
                invite_properties = {'INVITED_BY_ID' : creator_node.identity, 'INVITED_DATE': invited_date, 'STATUS' : 'PENDING'}
                self.create_relationship(node_a=invitee_node, relationship_label='INVITED', node_b=event_node, properties=invite_properties)
            tx.commit()
            return event_node
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            print(traceback.format_exc())
            tx.rollback()
            raise error
    
    def backload_event(self, created_by_id: int, properties: dict, friends_invited: list=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        event_node = None
        if friends_invited is None:
            friends_invited = []
        tx = self.graph.begin()
        try:
            creator_node = self.get_node_by_id(node_id=created_by_id)
            event_node = self.create_event_node(properties=properties)
            self.create_relationship(node_a=creator_node, relationship_label='CREATED_EVENT', node_b=event_node)
            self.create_relationship(node_a=event_node, relationship_label='CREATED_BY', node_b=creator_node)
            
            event_type_node = self.get_event_type_node_by_event_type_id(event_type_id=properties['EventTypeID'])
            self.create_relationship(node_a=event_type_node, relationship_label='RELATED_EVENT', node_b=event_node)
            self.create_relationship(node_a=event_node, relationship_label='EVENT_TYPE', node_b=event_type_node)
            
            invite_properties = {'INVITED_BY_ID' : created_by_id, 'INVITED_DATE': properties['EventCreatedAt'], 'STATUS' : 'PENDING'}
            for invitee_id in eval(friends_invited):
                invitee_node = self.get_node_by_id(node_id=invitee_id)
                self.create_relationship(node_a=invitee_node, relationship_label='INVITED', node_b=event_node, properties=invite_properties)
            tx.commit()
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            tx.rollback()
            raise error
    
    def create_attending_relationship(self, attendee_node: Node, event_node: Node, properties: dict=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        ### Make this function so that it can take attendee nodes or IDs
        try:
            self.create_relationship(node_a=attendee_node, relationship_label='ATTENDING', node_b=event_node, properties=properties)
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not created ATTENDING relationship between person_node: {attendee_node} ->{event_node}')

    def delete_attending_relationship(self, attending_relationship_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        try:
            relationship= self.get_relationship_by_uuid(relationship_uuid=attending_relationship_uuid)
            self.graph.delete(relationship)
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not delete ATTENDING relationship {relationship}')


    def create_attending_relationship_by_id(self, attendee_node_id: int, event_node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        try:
            self.run_command(queries.CREATE_ATTENDING_RELATIONSHIP_BY_NODES_IDS.format(person_id=attendee_node_id, event_id=event_node_id))
        except:
            self.logger.error(traceback.format_exc())
            raise Exception(f'Could not create ATTENDING relationship between person_node: {attendee_node_id} ->{event_node_id}')

    def create_interested_in_relationship(self, account_id: int, event_type_ids: Union[int, list]):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        if isinstance(event_type_ids, int):
            event_type_id_list = [event_type_ids]
        else:
            event_type_id_list = event_type_ids
        self.run_command(queries.CREATE_ACCOUNT_INTERESTED_IN_RELATIONSHIPS.format(account_id=account_id, interest_id_list=event_type_ids))
    
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
    
    def create_friend_request(self, node_a: Node=None, node_b: Node=None, email_a: str=None, email_b: str=None):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        properties = {'FRIEND_REQUEST_TS' : datetime.now().strftime(datetime_format), 'STATUS' : 'PENDING'}
        if node_a and node_b:
            self.create_relationship(node_a=node_a, relationship_label='FRIEND_REQUEST', node_b=node_b, properties=properties)
        elif email_a and email_b:
            node_a = self.get_account_node(email=email_a)
            node_b = self.get_account_node(email=email_b)
            self.create_relationship(node_a=node_a, relationship_label='FRIEND_REQUEST', node_b=node_b, properties=properties)
        else:
            raise ValueError("create_friend_request requires both (node_a and node_b) or both (email_a and email_b)")
            
        # return self.run_command(queries.CREATE_FRIEND_REQUEST.format(node_a=node_a, node_b=node_b, properties=properties))

    def accept_friend_request(self, node_a: int, node_b: int, friend_request_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        current_timestamp = datetime.now().strftime(datetime_format)
        properties = {'FRIENDS_SINCE' : current_timestamp}
        tx = self.graph.begin()
        try:
            relationship = self.execute_query(queries.GET_RELATIONSHIP_BY_UUID.format(relationship_label='FRIEND_REQUEST', uuid=friend_request_uuid))[0]['r']
            
            relationship['STATUS'] = 'ACCEPTED'
            relationship['RESPONSE_TIMESTAMP'] = current_timestamp
            self.graph.push(relationship)
            
            self.create_relationship(node_a=node_a, relationship_label='FRIENDS_WITH', node_b=node_b, properties=properties)
            self.create_relationship(node_a=node_b, relationship_label='FRIENDS_WITH', node_b=node_a, properties=properties)
            # return self.run_command(queries.CREATE_FRIENDSHIP.format(node_a=node_a, node_b=node_b, properties=properties))
            self.logger.info(f'Created FRIENDS_WITH relationship between {node_a["Email"]}<->{node_b["Email"]}')
            tx.commit()
        except Exception as error:
            self.logger.error(f'Could not create FRIENDS_WITH relationship between {node_a["Email"]}<->{node_b["Email"]}')
            self.logger.error(traceback.format_exc())
            tx.rollback()
            raise error
    
    def decline_friend_request(self, node_a: int, node_b: int, friend_request_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        relationship = self.execute_query(queries.GET_RELATIONSHIP_BY_UUID.format(relationship_label='FRIEND_REQUEST', uuid=friend_request_uuid))[0]['r']
        
        relationship['STATUS'] = 'DECLINE'
        relationship['RESPONSE_TIMESTAMP'] = datetime.now().strftime(datetime_format)
        self.graph.push(relationship)
        
        self.logger.info(f'{node_a["Email"]} declined Friend Request from {node_b["Email"]}')
    
    def accept_event_invite(self, event_invite_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        current_timestamp = datetime.now().strftime(datetime_format)
        tx = self.graph.begin()
        try:
            relationship = self.get_relationship_by_uuid(relationship_label='INVITED', relationship_uuid=event_invite_uuid)
            relationship['STATUS'] = 'ACCEPTED'
            relationship['RESPONSE_TIMESTAMP'] = current_timestamp
            self.graph.push(relationship)
            
            properties = {'RESPONSE_TIMESTAMP' : current_timestamp}
            self.create_attending_relationship(attendee_node=relationship.start_node, event_node=relationship.end_node)
            tx.commit()
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            tx.rollback()
            raise error
    
    def decline_event_invite(self, event_invite_uuid: str):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        current_timestamp = datetime.now().strftime(datetime_format)
        tx = self.graph.begin()
        try:
            relationship = self.get_relationship_by_uuid(relationship_label='INVITED', relationship_uuid=event_invite_uuid)
            relationship['STATUS'] = 'DECLINED'
            relationship['RESPONSE_TIMESTAMP'] = current_timestamp
            self.graph.push(relationship)
            
            self.get_relationship_by_nodes_and_label(node_a=relationship.start_node, relationship_label='ATTENDING', node_b=relationship.end_node)
            tx.commit()
            
        except Exception as error:
            self.logger.error(traceback.format_exc())
            tx.rollback()
            raise error
        