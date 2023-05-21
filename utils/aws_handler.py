#! /usr/bin/python3

import json, traceback, requests
import boto3
from botocore.exceptions import ClientError

from utils.logger import Logger


class AWSHandler:
    def __init__(self, logger: Logger):
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
            self.logger.emit(msg=f'Successfully retrieved secrets')
            
            return secrets
            
        except ClientError as e:
            raise e
            
        except Exception as error:
            self.logger.emit(msg=error)
            self.logger.emit(msg=f'Traceback: {traceback.format_exc()}')
            raise ValueError(error)

    def invoke_api_gateway_endpoint(self):
        try:
            client = boto3.client('apigateway')

            https_response = requests.get(
                'https://0kj5kbx4e7.execute-api.us-east-1.amazonaws.com/test/neo4j-query',
                params={'node_id': 1219}
            )
            
            return https_response
            
        except ClientError as e:
            raise e
            
        except Exception as error:
            self.logger.emit(msg=error)
            raise ValueError(error)
        