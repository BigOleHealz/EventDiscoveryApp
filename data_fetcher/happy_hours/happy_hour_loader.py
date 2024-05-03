import os, json, sys
from uuid import uuid4

from datetime import datetime as dt, timedelta
import pytz

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

current = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(current)
sys.path.append(parent_dir)

grandparent_dir = os.path.dirname(parent_dir)
sys.path.append(grandparent_dir)

from db import queries
from db.db_handler import Neo4jDB
from utils.aws_handler import AWSHandler
from utils.constants import DATETIME_FORMAT
from utils.helper_functions import HelperFunctions
from utils.logger import Logger

sources = ['go-wanderly', 'miami-eater', 'timeout', 'philly_happy_hours']
# sources = ['philly_happy_hours']
start_date = dt.now() - timedelta(days=dt.now().weekday() + 1)
number_of_weeks = 1

class HappyHourParser:
  def __init__(self):
    self.__s3_bucket_name = "happy-hour-data"
    
    self.logger = Logger(name=f"happy_hour_loader")
    self.aws_handler = AWSHandler(logger=self.logger)
    
    self.neo4j = Neo4jDB(logger=self.logger)
    self.helper_functions = HelperFunctions(logger=self.logger)
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")  # May be unnecessary for newer versions of Chrome
    chrome_options.add_argument("--no-sandbox")  # This option is necessary for Heroku
    chrome_options.add_argument("--disable-dev-shm-usage")  

    self.driver = webdriver.Chrome(
                                    service=Service(ChromeDriverManager().install()), 
                                    options=chrome_options
                                )
    
    chrome_bin = os.environ.get("GOOGLE_CHROME_BIN", "chromedriver")
    chrome_options.binary_location = chrome_bin
        
    self.driver.set_page_load_timeout(30)
  
  def run_parser(self):
    
    for source in sources:
      with open(f"{source}.json", "r") as f:
        data = json.load(f)
      
      for happy_hour in data:
        website_link = happy_hour["website_link"]
        cleaned_website_link = website_link.replace('https://', '').replace('http://', '')
        s3_file_key = os.path.join(cleaned_website_link, "index.html")
        
        print(f"{website_link=}")
        # self.driver.get(website_link)
        # html_source = self.driver.page_source
        
        # self.aws_handler.write_to_s3(bucket=self.__s3_bucket_name, key=s3_file_key, data=html_source)
        
        for i in range(number_of_weeks):
          start_of_week_date = start_date + timedelta(weeks=i)

          
          print(happy_hour)
          lat_lon = self.helper_functions.get_lat_lon_from_address(happy_hour["address"])
          
          for weekday_num in happy_hour["days"]:
            hh_date = start_of_week_date + timedelta(days=weekday_num)
            est = pytz.timezone('US/Eastern')
            date_str = hh_date.strftime("%Y-%m-%d")
            
            datetime_start_str = f"{date_str}T{happy_hour['start_time']}"
            datetime_start_dt = dt.strptime(datetime_start_str, DATETIME_FORMAT)
            est_datetime_start_dt = est.localize(datetime_start_dt)
            utc_datetime_start_dt = est_datetime_start_dt.astimezone(pytz.utc)
            utc_datetime_start_str = utc_datetime_start_dt.strftime(DATETIME_FORMAT)
            
            datetime_end_str = f"{date_str}T{happy_hour['end_time']}"
            datetime_end_dt = dt.strptime(datetime_end_str, DATETIME_FORMAT)
            est_datetime_end_dt = est.localize(datetime_end_dt)
            utc_datetime_end_dt = est_datetime_end_dt.astimezone(pytz.utc)
            utc_datetime_end_str = utc_datetime_end_dt.strftime(DATETIME_FORMAT)
            
            event_data = {
                "UUID": str(uuid4()),
                "StartTimestamp" : utc_datetime_start_str,
                "EndTimestamp" : utc_datetime_end_str,
                "EventName" : f"{happy_hour['host']} Happy Hour",
                "Source" : source,
                "SourceEventID": source,
                "EventURL": happy_hour["website_link"],
                "Lon" : lat_lon["lng"],
                "Lat" : lat_lon["lat"],
                "Address" : happy_hour["address"],
                "Host" : happy_hour["host"],
                "PublicEventFlag" : True,
                "EventDescription" : happy_hour["description"],
                "Summary" : happy_hour["description"],
                "ImageURL": happy_hour["website_link"],
                "EventPageURL": happy_hour['website_link'],
                "Price": "Free",
                "FreeEventFlag": True,
                "EventTypeUUID": "7abfc211-b49b-4572-8646-acb8fdfffb6c",
                "EventType": "Food & Drinks Specials",
                "EmbeddableFlag": happy_hour["embeddable_flag"],
                "S3Link": f"http://{self.__s3_bucket_name}.s3-website-us-east-1.amazonaws.com/{s3_file_key}"
            }
            
            self.neo4j.execute_query_with_params(query=queries.CREATE_HAPPY_HOUR_EVENT_IF_NOT_EXISTS, params=event_data)

if __name__ == "__main__":
  happy_hour_parser = HappyHourParser()
  happy_hour_parser.run_parser()
    