#! /usr/bin/python3.8
import abc, os, traceback, sys

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

from db.metadata_db_handler import MetadataHandler
from data_fetcher.eventbrite.EventbriteDataHandler import EventbriteDataHandler
from data_fetcher.meetup.MeetupDataHandler import MeetupDataHandler
from data_fetcher.google_events_api.GoogleEventsApiDataHandler import GoogleEventsApiDataHandler
from utils.aws_handler import AWSHandler
from utils.logger import Logger

source_handler_mapping = {
    "eventbrite": EventbriteDataHandler,
    "meetup": MeetupDataHandler,
    "google_events_api": GoogleEventsApiDataHandler,
}
class DataIngestionHandler(MetadataHandler, abc.ABC):
    def __init__(self):
        self.logger = Logger(name=f"data_ingestion")
        self.aws_handler = AWSHandler(logger=self.logger)
        super().__init__(logger=self.logger)

    def run(self):
        df_ingestions_to_be_performed = self.get_ingestions_to_attempt()
        for _, row in df_ingestions_to_be_performed.iterrows():
            try:
                handler = source_handler_mapping[row['source']](row=row, aws_handler=self.aws_handler)
                handler.run()
            except Exception as e:
                self.logger.error(msg=e)
                self.logger.error(msg=traceback.format_exc())
                pass
