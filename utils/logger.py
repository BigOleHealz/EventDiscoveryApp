import logging
import sys
from datetime import datetime

class Logger(logging.Logger):

    def __init__(self, name: str):
        super().__init__(name, level=logging.DEBUG)

        self.timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')

        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setLevel(logging.DEBUG)  # Set the level to DEBUG to capture all logs

        # Set a formatter
        formatter = logging.Formatter("%(asctime)s [%(levelname)s] - %(name)s - %(message)s")
        stream_handler.setFormatter(formatter)

        # Add the handler to the logger
        self.addHandler(stream_handler)

        self.setLevel(logging.DEBUG)

        
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

    logger.info("This is an info log.")
    logger.debug("This is a debug log.")
    logger.warning("This is a warning log.")
    logger.critical("This is a critical log.")
    logger.error("This is an error log.")
