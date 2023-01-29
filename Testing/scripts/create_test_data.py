
import random, os
from datetime import datetime as dt, timedelta
import pandas as pd

import os
import requests

import pandas as pd

class CreateTestData:
    def __init__(self):
        self.__data_folder_path = os.path.join(os.getcwd(), '..', 'data')
        self.__raw_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'raw')
        self.__enriched_data_folder_path = os.path.join(self.__data_folder_path, 'csv', 'enriched')
    
    @staticmethod
    def __geocode(address):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={os.environ['GOOGLE_MAPS_API_KEY']}"
        response = requests.get(url)
        resp_json_payload = response.json()
        lat_long = resp_json_payload['results'][0]['geometry']['location']
        return lat_long

    def create_enriched_locations_data_csv(self):
        input_fule = os.path.join(self.__raw_data_folder_path, 'business_addresses.csv')
        df = pd.read_csv(input_fule)

        lat_lng = df['Address'].apply(self.__geocode)

        df['Lat'] = [cell['lat'] for cell in lat_lng]
        df['Lng'] = [cell['lng'] for cell in lat_lng]
        
        df.to_csv(os.path.join(self.__enriched_data_folder_path, 'businesses.csv'), index=False)
    

if __name__ == '__main__':
    ctd = CreateTestData()
    ctd.create_enriched_locations_data_csv()


# city_data = {
#     'Philadelphia' : {
#         'lon' : {
#             'min' : -75.222864,
#             'max' : -75.141320
#         },
#         'lat' : {
#             'min' : 39.905712,
#             'max' : 39.977753
#         }
#     }
# }

# event_types = ['Drinking', 'Sports', 'Games', 'Religious', 'Finance', 'Real Estate', 'Concert']

# min_date = dt.today().date()
# max_date = dt(min_date.year, 12, 31)
# max_num_events = 25
# max_created_by = 100
# event_id = 0

# df = pd.DataFrame(columns=['EventID', 'CreatedByID', 'EventType', 'Lon', 'Lat', 'Date/Time'])
# for date in pd.date_range(min_date, max_date, freq='d'):
    
#     print(date)
    
#     for _ in range(random.randint(1, max_num_events)):
#         event_type = random.choice(event_types)
        
#         created_by_id = random.randint(0, max_created_by)
        
#         lon = round(random.uniform(city_data['Philadelphia']['lon']['min'], city_data['Philadelphia']['lon']['max']), 6)
#         lat = round(random.uniform(city_data['Philadelphia']['lat']['min'], city_data['Philadelphia']['lat']['max']), 6)
        
#         date_time = date + timedelta(hours=random.randint(0, 23))
        
#         row = {'EventID' : event_id, 'CreatedByID' : created_by_id, 'EventType' : event_type, 'Lon' : lon, 'Lat' : lat, 'Date/Time' : date_time}
#         df = df.append(row, ignore_index=True)
        
#         event_id += 1

# df["EventCreatedAt"] = df.apply(lambda x: x["Date/Time"] - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23), minutes=random.randint(0, 59)), axis=1)

# df.to_csv(os.path.join(os.getcwd(), '..', 'data', 'sample_data.csv'), index=False)    

