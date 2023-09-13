#! /usr/bin/python3.8
import abc, os, json, traceback, sys
from uuid import uuid4
import pandas as pd
from datetime import datetime as dt


import openai

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
# home = os.path.dirname(parent)
sys.path.append(parent)

from db.db_handler import Neo4jDB
from db.metadata_db_handler import MetadataHandler
from eventbrite.fetch_events_from_eventbrite import EventbriteDataHandler
from utils.aws_handler import AWSHandler
from utils.logger import Logger

source_handler_mapping = {
    "eventbrite": EventbriteDataHandler
}
class DataIngestionHandler(MetadataHandler, abc.ABC):
    def __init__(self):
        self.logger = Logger(log_group_name=f"data_ingestion")
        super().__init__(logger=self.logger)
        self.neo4j = Neo4jDB(logger=self.logger)
        self.aws_handler = AWSHandler(logger=self.logger)

    def run(self):
        df_ingestions_to_be_performed = self.get_ingestions_to_attempt()
        for _, row in df_ingestions_to_be_performed.iterrows():
            try:
                handler = source_handler_mapping[row['source']](row=row, aws_handler=self.aws_handler, logger=self.logger)
                handler.run()
            except Exception as e:
                self.logger.error(msg=e)
                self.logger.error(msg=traceback.format_exc())
                pass
            
