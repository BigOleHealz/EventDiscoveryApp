#! /usr/bin/python3.8
import abc, os, json, traceback, sys

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

from db.metadata_db_handler import MetadataHandler
from DataHandler import DataIngestionHandler
from utils.aws_handler import AWSHandler
from utils.logger import Logger

def run():
    data_ingestion_handler = DataIngestionHandler()
    data_ingestion_handler.run()

if __name__ == "__main__":
    run()