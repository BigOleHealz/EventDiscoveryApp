import sys, traceback
sys.path.append('/opt/python')


import json, traceback
from utils.logger import Logger
from db.db_handler import Neo4jDB

def lambda_handler(event: dict, context: dict):
    #just checking to make sure this works
    try:
        logger = Logger(log_group_name='get_node')
        neo4j_connector = Neo4jDB(logger=logger)
        
        query_string_parameters_string = 'queryStringParameters'
        if not event.get(query_string_parameters_string):
            raise ValueError(f'Event is missing: {query_string_parameters_string}" key. Received {event=}')
        query_string_params = event[query_string_parameters_string]
        

        node = neo4j_connector.get_node(**query_string_params)

        node_dict = dict(node)
        
        response_object = {
            'statusCode' : 200,
            'headers'    : {
                'Content-Type' : 'application/json'
            },
            'body' : json.dumps(node_dict)
        }
        
        return response_object

    except Exception as error:
        traceback_error = traceback.format_exc()
        logger.error(f"Error: {error}")
        logger.error(f"Traceback: {traceback_error}")
        return {
            'statusCode' : 300,
            'headers'    : {
                'Content-Type' : 'application/json'
            },
            'body' : json.dumps({"Error" : f"{error}",
                                 "TraceBack" : f'{traceback.format_exc()}'
                                })
        }
