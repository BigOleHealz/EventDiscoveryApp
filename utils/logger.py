import logging, sys, time, traceback
from datetime import datetime

import boto3
from botocore.exceptions import ClientError


class Logger(logging.Logger):

    def __init__(self, log_group_name: str):
        super().__init__(name=log_group_name)
        
        self.timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
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

    def log(self, msg: str, level: str):
        INFO_LEVEL_STRING = 'INFO'
        DEBUG_LEVEL_STRING = 'DEBUG'
        WARNING_LEVEL_STRING = 'WARNING'
        CRITICAL_LEVEL_STRING = 'CRITICAL'
        ERROR_LEVEL_STRING = 'ERROR'
        
        acceptable_log_level_strings = [INFO_LEVEL_STRING, DEBUG_LEVEL_STRING, WARNING_LEVEL_STRING, CRITICAL_LEVEL_STRING, ERROR_LEVEL_STRING]
        
        if level not in acceptable_log_level_strings:
            raise ValueError(f"Received argument {level} for parameter 'level'. Argument 'level must be one of the" + \
                            f"following values: [{','.join(acceptable_log_level_strings)}]")
        
        if level == INFO_LEVEL_STRING:
            self.info(msg)
        elif level == DEBUG_LEVEL_STRING:
            self.debug(msg)
        else:
            pass
    
    def emit(self, msg: str, level: str = ''):
        try:
            self.cloudwatch_logs.put_log_events(
                logGroupName=self.log_group_name,
                logStreamName=self.log_stream_name,
                logEvents=[
                    {
                        'timestamp': int(round(time.time() * 1000)),
                        'message': f'[{level}] {msg}'
                    }
                ]
            )
        except Exception as e:
            self.error("CloudWatchLogger.emit error: {}".format(e))

    def info(self, msg: str):
        self.emit(msg=msg, level='INFO')

    def error(self, msg: str):
        self.emit(msg=msg, level='ERROR')