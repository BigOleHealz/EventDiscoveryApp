#! /usr/bin/python3

import json, traceback, requests
import boto3
from botocore.exceptions import ClientError

from utils.logger import Logger


class AWSHandler:
    def __init__(self, logger: Logger):
        self.logger = logger
        self.session = boto3.session.Session(region_name='us-east-1')
        self.s3_client = self.session.client('s3')
    
    def check_if_s3_file_exists(self, bucket: str, key: str):
        try:
            self.s3_client.head_object(Bucket=bucket, Key=key)
            self.logger.debug(msg=f"File {key} exists in bucket {bucket}")
            return True
        except ClientError as e:
            error_code = int(e.response['Error']['Code'])
            if error_code == 404:
                return False
            else:
                self.logger.error(msg=f"An error occurred while checking for the file {key} in bucket {bucket}: {e}")
                raise e
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)
    
    def list_files_in_s3_prefix_recursive(self, bucket: str, prefix: str):
        try:
            response = self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)
            self.logger.info(msg=f"Successfully listed files in bucket {bucket} with prefix {prefix}")
            if 'Contents' not in response:
                self.logger.debug(msg=f"No files found in bucket {bucket} with prefix {prefix}")
                return []
            return response
        except ClientError as e:
            self.logger.error(msg=f"An error occurred while listing files in bucket {bucket} with prefix {prefix}: {e}")
            raise e
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)

    def list_files_and_folders_in_s3_prefix(self, bucket: str, prefix: str):
        try:
            if not prefix.endswith('/'):
                prefix += '/'

            response = self.s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix, Delimiter='/')
            
            folders = []
            if 'CommonPrefixes' in response:
                folders = [cp['Prefix'] for cp in response['CommonPrefixes']]
                
            # Getting the files (known as "Contents" in S3)
            files = []
            if 'Contents' in response:
                files = [content['Key'] for content in response['Contents'] if content['Key'] != prefix]
            
            self.logger.debug(msg=f"Successfully listed files and folders in bucket {bucket} with prefix {prefix}")
            return {'files': files, 'folders': folders}
        except ClientError as e:
            self.logger.error(msg=f"An error occurred while listing files and folders in bucket {bucket} with prefix {prefix}: {e}")
            raise e
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)

    def read_from_s3(self, bucket: str, key: str):
        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            data = response['Body'].read().decode('utf-8')
            self.logger.debug(msg=f'Successfully retrieved data from S3: {bucket}/{key}')
            return data
        except ClientError as e:
            self.logger.error(msg=f'Failed to read from S3: {e}')
            raise e
        except Exception as error:
            self.logger.error(msg=error)
            raise ValueError(error)

    def write_to_s3(self, bucket: str, key: str, data: str):
        response = self.s3_client.put_object(
            Body=data,
            Bucket=bucket,
            Key=key
        )
        return response
