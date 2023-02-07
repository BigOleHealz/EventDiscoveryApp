import os, logging
from datetime import datetime

class Logger(logging.Logger):
    def __init__(self, name, level=logging.NOTSET):
        super().__init__(name, level)
        
        self.setLevel(logging.DEBUG)
        handler = logging.FileHandler(os.path.join(os.environ['EVENT_APP_HOME'], 'logs', f'{datetime.now().strftime("%Y-%m-%dT%H:%M:%S")}.log'))

        # create formatter
        formatter = logging.Formatter("%(asctime)s [%(levelname)s] - %(module)s.%(funcName)s(%(lineno)d) - %(message)s")

        # add formatter to handler
        handler.setFormatter(formatter)

        # add handler to logger
        self.addHandler(handler)

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