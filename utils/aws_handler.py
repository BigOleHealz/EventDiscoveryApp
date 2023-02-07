#! /usr/bin/python3

import json

import boto3
from botocore.exceptions import ClientError

from utils.logger import Logger


class AWSHandler:
    def __init__(self, logger: Logger):
        self.logger = logger
        self.session = boto3.session.Session()

    def get_secret(self, secret_key: str=None):
        secret_name = "/credentials"

        try:
            client = self.session.client(
                service_name='secretsmanager'
            )

            secrets = client.get_secret_value(
                SecretId=secret_name
            )

            secrets = json.loads(secrets['SecretString'])
            self.logger.info(msg=f'Successfully retrieved secrets')
            if secret_key:
                secret = secrets.get(secret_key)
                if secret:
                    return secrets.get(secret_key)
                else:
                    raise ValueError( f'No secret found with the following parameters: {secret_name=}, {secret_key=}, Region: {self.session.region_name}')
            else:
                return secrets
            
        except ClientError as e:
            raise e
            
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)
        

    # Your code goes here.

if __name__ == "__main__":
    get_secret()