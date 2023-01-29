import os
from py2neo import Graph, Node, Relationship

class Neo4jDB:
    def __init__(self):
        # Connection string for the Neo4j database
        self.cxn_string = "bolt://100.26.167.168:7687"

        self.graph = Graph(self.cxn_string, auth=("neo4j", os.environ.get('NEO4J_PASSWORD')))
    
    def run_command(self, command: str):
        self.graph.run(command)
    
    def create_node(self, node_type: str, properties: dict=None):
        if properties is None:
            properties = {}
        node = Node(node_type, **properties)
        self.graph.create(node)
    
    def create_relationship(self, a_node: Node, relationship_label: str, b_node: Node):
        relationship = Relationship(a_node, relationship_label, b_node)
        self.graph.create(relationship)
