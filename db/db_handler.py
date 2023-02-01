import os

from py2neo import Graph, Node, Relationship
from db import queries

class Neo4jDB:
    def __init__(self):
        # Connection string for the Neo4j database
        self.cxn_string = "bolt://100.26.167.168:7687"
        self.graph = Graph(self.cxn_string, auth=("neo4j", os.environ.get('NEO4J_PASSWORD')))
    
    #######################
    ###### DO BETTER ######
    #######################
    @staticmethod
    def __dict_to_cypher_props(property_dict: dict):
        def caster(val):
            if val is True:
                return 'true'
            elif isinstance(val, int):
                return val
            else:
                return f'"{val}"'
        return '{' + ', '.join([f"{k}: {caster(v)}" for k, v in property_dict.items()]) + '}'
    
    @staticmethod
    def __create_account_match_string(accound_ids: list):
        return ', '.join([f'(u{i}:User {{AccountID:{account_id}}})' for i, account_id in enumerate(accound_ids)])
    
    @staticmethod
    def __create_account_invite_string(accound_ids: list):
        return ', '.join([f'(u{i})-[:INVITED]->(event)' for i in range(len(accound_ids))])
    #######################
    ###### DO BETTER ######
    #######################
    
    def run_command(self, command: str):
        return self.graph.run(command)
    
    def execute_query(self, query: str):
        result = self.run_command(query)
        result = [rec for rec in result]
        
        return result
        
    def __create_node(self, node_type: str, properties: dict=None):
        if properties is None:
            properties = {}
        node = Node(node_type, **properties)
        self.graph.create(node)
        
        return node
    
    def create_relationship(self, a_node: Node, relationship_label: str, b_node: Node):
        relationship = Relationship(a_node, relationship_label, b_node)
        self.graph.create(relationship)
    
    def __create_event_node(self, properties: dict=None):
        node = self.__create_node(node_type='Event', properties=properties)
        return node
    
    # def invite_user()
    
    def delete_node_by_id(self, node_id: int):
        self.run_command(queries.DELETE_NODE_BY_ID.format(node_id=node_id))
        
    
    def create_event(self, properties: dict, friends_invited: list=None):
        event_node = None
        try:
            if friends_invited is None:
                friends_invited = []
            props = self.__dict_to_cypher_props(property_dict=properties)
            command = queries.CREATE_EVENT_WITH_RELATIONSHIPS.format(properties=props,
                                                                    event_type_id=properties['EventTypeID'],
                                                                    account_match_str=self.__create_account_match_string(friends_invited),
                                                                    account_invite_str=self.__create_account_invite_string(friends_invited),
                                                                    creator_id=int(os.environ['USER_ACCOUNT_ID'])
                                                                )
        self.run_command(command=command)
        except Exception as error:
            print(error)
            if event_node:
                self.delete_node_by_id(event_node.identity)
            print(f'Node not created because of error: {error}')
            
            
        

if __name__ == '__main__':
    neo4j = Neo4jDB()
    neo4j.execute_query('MATCH (n:EventType) RETURN n.EventName;')
