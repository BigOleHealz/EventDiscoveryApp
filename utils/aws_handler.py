#! /usr/bin/python3

import json, traceback, requests
import boto3
from botocore.exceptions import ClientError

from utils.logger import Logger


class AWSHandler:
    def __init__(self, logger: Logger=None):
        if logger is None:
            logger = Logger(__name__)
        self.logger = logger
        self.session = boto3.session.Session()

    def get_secret(self, secret_name: str=None):

        try:
            client = self.session.client(
                service_name='secretsmanager'
            )

            secrets = client.get_secret_value(
                SecretId=secret_name
            )

            secrets = json.loads(secrets['SecretString'])
            self.logger.info(msg=f'Successfully retrieved secrets')
            
            return secrets
            
        except ClientError as e:
            raise e
            
        except Exception as error:
            self.logger.error(msg=error)
            self.logger.error(msg=f'Traceback: {traceback.format_exc()}')
            raise ValueError(error)

    def invoke_api_gateway_endpoint(self):
        try:
            client = boto3.client('apigateway')

            # response = client.invoke_rest_api(
            #     restApiId='0kj5kbx4e7',
            #     resourceId='kznk7b',
            #     httpMethod='GET',
            #     pathWithQueryString='/get_node?node_id=1219',
            #     # body='{"message": "Hello, world!"}',
            # )
            https_response = requests.get(
                'https://0kj5kbx4e7.execute-api.us-east-1.amazonaws.com/test/neo4j-query',
                params={'node_id': 1219},
                # headers={'day': calendar.day_name[datetime.date.today().weekday()]},
                # json={'adjective': 'fabulous'}
            )
            
            return https_response
            
        except ClientError as e:
            raise e
            
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)
        