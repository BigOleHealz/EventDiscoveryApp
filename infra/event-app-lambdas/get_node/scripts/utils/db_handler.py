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
    
    
    def get_node(self, node_id: int):
        self.logger.debug(f'Running {sys._getframe().f_code.co_name}')
        result = self.execute_query(queries.GET_NODE_BY_ID.format(node_id=node_id))
        if len(result) == 0:
            raise ValueError(f'Could not find node with id = {node_id}')
        node = result[0]['n']
        return node
