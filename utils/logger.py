import logging, sys, time, traceback
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

class Logger(logging.Logger):

    def __init__(self, log_group_name: str, log_stream_name: str = None):
        super().__init__(name=log_group_name)
        
        self.timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
        self.log_group_name = log_group_name
        self.log_stream_name = log_stream_name if log_stream_name else self.timestamp
        
        self.cloudwatch_logs = boto3.client('logs', region_name='us-east-1')

        # try:
        try:
        #     self.cloudwatch_logs.describe_log_groups(logGroupNamePrefix=self.log_group_name)
        # except self.cloudwatch_logs.exceptions.ResourceNotFoundException:
            self.cloudwatch_logs.create_log_group(logGroupName=self.log_group_name)
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
                print(f'Log Group already exists: {self.log_group_name}\nError{e}')
            else:
                print(f'Error creating log group: {e}')
                raise Exception(f'Traceback: {traceback.format_exc()}')

        try:
            self.cloudwatch_logs.create_log_stream(logGroupName=self.log_group_name, logStreamName=self.log_stream_name)
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceAlreadyExistsException':
                print(f'Log stream already exists: {self.log_group_name}/{self.log_stream_name}\nError{e}')
            else:
                print(f'Error creating log stream: {e}')
                raise Exception(f'Traceback: {traceback.format_exc()}')

        self.sequence_token = None
        
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        self.handler = logging.StreamHandler(sys.stdout)
        self.handler.setLevel(logging.INFO)
        self.formatter = logging.Formatter("%(asctime)s [%(levelname)s] - %(module)s.%(funcName)s(%(lineno)d) - %(message)s")
        self.handler.setFormatter(self.formatter)
        self.logger.addHandler(self.handler)
        
    @property
    def log_level_function_mappings(self):
        return {
            'INFO': self.info,
            'DEBUG': self.debug,
            'WARNING': self.warning,
            'CRITICAL': self.critical,
            'ERROR': self.error
        }
    
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
        msg_formatted = f'[{level}] {msg}' if level else msg
        print(msg_formatted)
        try:
            self.cloudwatch_logs.put_log_events(
                logGroupName=self.log_group_name,
                logStreamName=self.log_stream_name,
                logEvents=[
                    {
                        'timestamp': int(round(time.time() * 1000)),
                        'message': msg_formatted
                    }
                ]
            )
        except Exception as e:
            self.error("CloudWatchLogger.emit error: {}".format(e))

    def info(self, msg: str):
        self.emit(msg=msg, level='INFO')

    def debug(self, msg: str):
        self.emit(msg=msg, level='DEBUG')

    def warning(self, msg: str):
        self.emit(msg=msg, level='WARNING')
        
    def critical(self, msg: str):
        self.emit(msg=msg, level='CRITICAL')

    def error(self, msg: str):
        self.emit(msg=msg, level='ERROR')
