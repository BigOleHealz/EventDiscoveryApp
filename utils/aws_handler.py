#! /usr/bin/python3

import json

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
            raise ValueError(error)
        

if __name__ == "__main__":
    get_secret()