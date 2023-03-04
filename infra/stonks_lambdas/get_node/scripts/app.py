import sys
sys.path.append('/opt/python')


import json, traceback
from utils.logger import Logger
from utils.db_handler import Neo4jDB

def lambda_handler(event: dict, context: dict):
    #just checking to make sure this works
    try:
        logger = Logger(log_group_name='get_node')
        neo4j_connector = Neo4jDB(logger=logger)
        node_id = event['queryStringParameters']['node_id']
        node = neo4j_connector.get_node(node_id=node_id)
        node_dict = dict(node)
        
        response_object = {
            'statusCode' : 200,
            'headers'    : {
                'Content-Type' : 'application/json'
            },
            'body' : json.dumps({"node_id" : node_dict})
        }
        
        return response_object

    except Exception as error:
        traceback_error = traceback.format_exc()
        return traceback_error