import sys, traceback
sys.path.append('/opt/python')


import json, traceback
from utils.logger import Logger
from db.db_handler import Neo4jDB

def lambda_handler(event: dict, context: dict):
    try:
        logger = Logger(log_group_name='execute_query')
        neo4j_connector = Neo4jDB(logger=logger)
        
        query_string_parameters_string = 'query'
        if not event.get(query_string_parameters_string):
            raise ValueError(f'Event is missing: {query_string_parameters_string}" key. Received {event=}')

        command = event[query_string_parameters_string]
        logger.emit(msg=f"{command=}")
        if 'return' in command.lower():
            result = neo4j_connector.execute_query(command)
            print(result)
        else:
            result = neo4j_connector.run_command(command)
            
        response_object = {
            'statusCode' : 200,
            'headers'    : {
                'Content-Type' : 'application/json'
            },
            'body' : result
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
