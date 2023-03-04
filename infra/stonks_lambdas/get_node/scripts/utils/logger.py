import logging, sys, time, traceback
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

class Logger(logging.Logger):

    def __init__(self, log_group_name: str):
        super().__init__(name=log_group_name)
        
        self.timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
        self.log_group_name = log_group_name
        self.log_stream_name = self.timestamp
        
        self.cloudwatch_logs = boto3.client('logs')

        try:
            self.cloudwatch_logs.create_log_group(logGroupName=self.log_group_name)
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceAlreadyExistsException':
                raise Exception(f'Traceback: {traceback.format_exc()}')

        try:
            self.cloudwatch_logs.create_log_stream(logGroupName=self.log_group_name, logStreamName=self.log_stream_name)
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceAlreadyExistsException':
                raise Exception(f'Traceback: {traceback.format_exc()}')
        
        self.sequence_token = None
        
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        self.handler = logging.StreamHandler(sys.stdout)
        self.handler.setLevel(logging.INFO)
        self.formatter = logging.Formatter("%(asctime)s [%(levelname)s] - %(module)s.%(funcName)s(%(lineno)d) - %(message)s")
        self.handler.setFormatter(self.formatter)
        self.logger.addHandler(self.handler)
        
        self.emit('logger initiated')
    
    def emit(self, msg: str):
        try:
            self.cloudwatch_logs.put_log_events(
                logGroupName=self.log_group_name,
                logStreamName=self.log_stream_name,
                logEvents=[
                    {
                        'timestamp': int(round(time.time() * 1000)),
                        'message': msg
                    }
                ]
            )
        except Exception as e:
            self.error("CloudWatchLogger.emit error: {}".format(e))
