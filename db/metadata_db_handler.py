#! /usr/bin/python3.8
import abc, traceback
from datetime import datetime, timedelta
import pandas as pd

import pymysql

from  db import rds_queries
from utils.aws_handler import AWSHandler
from utils.logger import Logger
from utils.constants import DATE_FORMAT
from utils.logger import Logger

class MetadataHandler(abc.ABC):
    def __init__(self, aws_handler: AWSHandler=None, logger: Logger=None):
        if logger is None:
            logger = Logger(name=f"metadata_handler")
        self.logger = logger
        if aws_handler is None:
            aws_handler = AWSHandler(logger=self.logger)
        self.aws_handler = aws_handler

        connection_details = {}
        try:
            db_credentials = self.aws_handler.get_secret(secret_name="rds!cluster-cacb36b2-20f8-4aaa-9966-9b6f1e39756d")
            db_endpoint_data = self.aws_handler.get_secret(secret_name="dev_metadata_db_endpoint")

            db_username = db_credentials['username']
            db_password = db_credentials['password']
            db_host = db_endpoint_data['host']
            db_port = int(db_endpoint_data['port'])
            database = db_endpoint_data['database']
            connection_details = {
                'user': db_username,
                'password': db_password,
                'host': db_host,
                'port': db_port,
                'database': database
            }
        except Exception as error:
            self.logger.error(msg=error)
            self.logger.error(msg=f"An error occurred while getting the database credentials from AWS Secrets Manager: {traceback.format_exc()}")
            raise error
        if not connection_details:
            raise Exception("connection_details cannot be empty")
        try:    
            self.connection = pymysql.connect(**connection_details)
            self.cursor = self.connection.cursor()

        except Exception as error:
            self.logger.error(msg=error)
            self.logger.error(msg=f"An error occurred while connecting to the database: {traceback.format_exc()}")
            raise error
    
    def fetchone(self, query: str):
        try:
            self.cursor.execute(query)
            result = self.cursor.fetchone()
            return result
        except Exception as error:
            self.logger.error(msg=error)
            self.logger.error(msg=f"An error occurred while executing the following query: {query}")
            raise error
    
    def fetchall(self, query: str):
        try:
            self.cursor.execute(query)
            result = self.cursor.fetchall()
            return result
        except Exception as error:
            self.logger.error(msg=error)
            self.logger.error(msg=f"An error occurred while executing the following query: {query}")
            raise error
    
    def get_event_type_source_mappings(self):
        event_source_mappings = self.fetchall(rds_queries.SELECT_EVENT_TYPE_SOURCE_MAPPINGS)
        df = pd.DataFrame(event_source_mappings, columns=['source_event_type_mapping_id', 'source_id', 'target_event_type_uuid', 'source_event_type_id', 'source_event_type_string'])
        return df
    
    def get_event_types(self):
        event_types = self.fetchall(rds_queries.SELECT_EVENT_TYPES)
        df = pd.DataFrame(event_types, columns=['event_type_uuid', 'target_event_type_string'])
        return df
    
    def get_sources(self):
        sources = self.fetchall(rds_queries.SELECT_SOURCES)
        df = pd.DataFrame(sources, columns=['source_id', 'source', 'source_url'])
        return df
    
    def calculate_dates_to_be_ingested(self):
        start_date = datetime.today()
        end_date = start_date + timedelta(days=3)
        date_list = [(start_date + timedelta(days=x)).strftime(DATE_FORMAT) for x in range((end_date-start_date).days + 1)]
        df = pd.DataFrame(date_list, columns=['date'])
        return df

    def get_regions(self):
        regions = self.fetchall(rds_queries.SELECT_REGIONS)
        df = pd.DataFrame(regions, columns=['region_id', 'city_code', 'state_code', 'country_code'])
        return df
    
    def get_relevant_ingestion_attempts(self, start_date: str):
        ingestion_attemps = self.fetchall(rds_queries.SELECT_INGESTION_ATTEMPTS_FOR_DATES_AFTER_TODAY.format(start_date=start_date))

        df = pd.DataFrame(ingestion_attemps, columns=['source_id', 'region_id', 'date', 'source_event_type_mapping_id'])
        df['date'] = df['date'].astype(str)
        return df

    def cartesian_product(self, df1, df2):
        df1['_tmpkey'] = 1
        df2['_tmpkey'] = 1

        res = pd.merge(df1, df2, on='_tmpkey').drop('_tmpkey', axis=1)

        return res

    def get_ingestions_to_attempt(self):
        df_sources = self.get_sources()
        df_event_type_source_mappings = self.get_event_type_source_mappings()
        df_event_types = self.get_event_types()
        df_dates_to_be_ingested = self.calculate_dates_to_be_ingested()
        df_regions = self.get_regions()

        df_event_type_source_mappings = pd.merge(df_event_type_source_mappings, df_event_types, left_on='target_event_type_uuid', right_on='event_type_uuid', how='left').drop('event_type_uuid', axis=1)
        df_sources_mapped_to_event_type_mappings = pd.merge(df_sources, df_event_type_source_mappings, on='source_id')
        df = self.cartesian_product(df_sources_mapped_to_event_type_mappings, df_regions)
        df = self.cartesian_product(df, df_dates_to_be_ingested)

        df_relevant_ingestion_attempts = self.get_relevant_ingestion_attempts(start_date=datetime.today().strftime(DATE_FORMAT))
        df_relevant_ingestion_attempts['ingestion_completed'] = True
                
        result_df = df.merge(df_relevant_ingestion_attempts, on=['source_id', 'region_id', 'date', 'source_event_type_mapping_id'], how='left')
        result_df = result_df[result_df['ingestion_completed'] != True].reset_index(drop=True).drop('ingestion_completed', axis=1)
        
        return result_df
    
    def insert_ingestion_attempt(self, row: pd.Series):
        query = rds_queries.INSERT_INGESTION_ATTEMPT.format(
            UUID=row['UUID'],
            source_id=row['source_id'],
            region_id=row['region_id'],
            date=row['date'],
            source_event_type_mapping_id=row['source_event_type_mapping_id']
        )
        
        self.cursor.execute(query)
        self.connection.commit()
    
    def update_ingestion_attempt(self, uuid: str, status: str):
        query = rds_queries.UPDATE_INGESTION_ATTEMPT_STATUS.format(
            UUID=uuid,
            status=status
        )
        
        self.cursor.execute(query)
        self.connection.commit()
    
    def update_raw_event_ingestion_status(self, uuid: str, status: str, error_message: str=None):
        if error_message is None:
            error_message = ''
        query = rds_queries.UPDATE_RAW_EVENT_INGESTION_STATUS.format(
            UUID=uuid,
            status=status,
            error_message=error_message
        )
        self.cursor.execute(query)
        self.connection.commit()
    
    def close_ingestion_attempt(self, uuid: str, status: str, success_count: int, error_count: int, virtual_count: int):
        query = rds_queries.CLOSE_INGESTION_ATTEMPT.format(
            UUID=uuid,
            status=status,
            success_count=success_count,
            error_count=error_count,
            virtual_count=virtual_count
        )
        
        self.cursor.execute(query)
        self.connection.commit()
    
    def insert_raw_event(self, record: dict):
        data = (
            record['UUID'], record['source'], record['source_id'], record['event_url'],
            record['ingestion_status'], record['ingestion_uuid'], record['region_id'],
            record['event_start_date'], record['s3_link'], record.get('error_message', '')
        )
        self.cursor.execute(rds_queries.INSERT_RAW_EVENT, data)
        self.connection.commit()
    
    def insert_event_successfully_ingested(self, record: dict):
        data = (
            record['UUID'], record['Address'], record['EventType'],
            record['EventTypeUUID'], record['StartTimestamp'], record['EndTimestamp'],
            record['ImageURL'], record['Host'], record['Lon'], record['Lat'],
            record['Summary'], record['PublicEventFlag'], record['FreeEventFlag'],
            record['Price'], record['EventDescription'], record['EventName'],
            record['SourceEventID'], record['EventPageURL']
        )

        self.cursor.execute(rds_queries.INSERT_EVENT_SUCCESSFULLY_INGESTED, data)
        self.connection.commit()
