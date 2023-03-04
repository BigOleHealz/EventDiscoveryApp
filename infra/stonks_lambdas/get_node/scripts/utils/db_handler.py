import os, traceback, sys

from py2neo import Graph, Node, Relationship
from utils import queries
from utils.logger import Logger
from utils.aws_handler import AWSHandler

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
    
    
    def get_node(self, **kwargs):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        try:
            required_params = ['node_id', 'email', 'username']
            if not any(key in kwargs for key in required_params):
                raise ValueError(f'{sys._getframe().f_code.co_name} requires at least one of {required_params}')

            if kwargs.get('node_id'):
                node_id = kwargs['node_id']
                result = self.execute_query(queries.GET_NODE_BY_ID.format(node_id=node_id))
                if not result:
                    raise ValueError(f'Could not find node with id = {node_id}')

            elif kwargs.get('email'):
                email = kwargs['email']
                result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_EMAIL.format(email=email))
                if not result:
                    raise ValueError(f'Could not find node with email = {email}')

            elif kwargs.get('username'):
                username = kwargs['username']
                result = self.execute_query(queries.GET_ACCOUNT_NODE_BY_USERNAME.format(username=username))
                if not result:
                    raise ValueError(f'Could not find node with username = {username}')

            else:
                raise Exception(f'kwargs problem occurred in {sys._getframe().f_code.co_name}')

            node = result[0]['n']
            return node

        except Exception as error:
            self.logger.error(f"Error: {error}")
            self.logger.error(f"Traceback: {traceback.format_exc()}")
