import logging
import sys
from datetime import datetime

class Logger(logging.Logger):

    def __init__(self, name: str):
        super().__init__(name)

        self.timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')

        # Set up basic configuration for the logger to output to STDOUT
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] - %(name)s - %(message)s",
            handlers=[
                logging.StreamHandler(sys.stdout)  # Ensures log output goes to STDOUT
            ]
        )
        
    def emit(self, level, msg, *args, **kwargs):
        if level not in [logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, logging.CRITICAL]:
            raise ValueError("Invalid log level specified")
        super().log(level, msg, *args, **kwargs)
        
    def info(self, msg: str):
        self.emit(level=logging.INFO, msg=msg)

    def debug(self, msg: str):
        self.emit(level=logging.DEBUG, msg=msg)

    def warning(self, msg: str):
        self.emit(level=logging.WARNING, msg=msg)
        
    def critical(self, msg: str):
        self.emit(level=logging.CRITICAL, msg=msg)

    def error(self, msg: str):
        self.emit(level=logging.ERROR, msg=msg)

# Usage example
if __name__ == "__main__":
    logger_name = 'heroku_app_logger'
    logger = Logger(name=logger_name)

    logger.info(logging.INFO, "This is an info log.")
    logger.error(logging.ERROR, "This is an error log.")
