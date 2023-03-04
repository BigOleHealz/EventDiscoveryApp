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
        self.region_name = "us-east-1"

    def assume_role(self):
        
        sts_client = boto3.client('sts')
        
        response = sts_client.assume_role(
            RoleArn='arn:aws:iam::123456789012:role/my-rolarn:aws:iam::620803767360:role/event-app-lambdas-GetNodeFunctionRole-14TXJQUZB94D3e',
            RoleSessionName='my-session'
        )
        
        self.access_key_id = response['Credentials']['AccessKeyId']
        self.secret_access_key = response['Credentials']['SecretAccessKey']
        self.session_token = response['Credentials']['SessionToken']
        
        
    def get_secret(self, secret_name: str=None):
        try:
            client = self.session.client(
                service_name='secretsmanager',
                region_name=self.region_name
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
