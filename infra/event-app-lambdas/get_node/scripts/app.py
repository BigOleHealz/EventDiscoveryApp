import sys
sys.path.append('/opt/dependencies')


import json, traceback
from utils.logger import Logger
from utils.db_handler import Neo4jDB

def lambda_handler(event: dict, context: dict):
    
    try:
        logger = Logger(log_group_name=__name__)
        neo4j_connector = Neo4jDB(logger=logger)
        node_id = event['node_id']
        node = neo4j_connector.get_node(node_id=node_id)
        
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": f'{node=}',
            }),
        }

    except Exception as error:
        
        return traceback.format_exc()
        logger.emit(f'Error: {error}')
        logger.emit(f'Traceback: {traceback.format_exc()}')
        raise traceback.format_exc()
