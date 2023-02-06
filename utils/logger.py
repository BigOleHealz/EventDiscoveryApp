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
