
import random, os
from datetime import datetime as dt, timedelta
import pandas as pd

city_data = {
    'Philadelphia' : {
        'lon' : {
            'min' : -75.222864,
            'max' : -75.141320
        },
        'lat' : {
            'min' : 39.905712,
            'max' : 39.977753
        }
    }
}

event_types = ['Drinking', 'Sports', 'Games', 'Religious', 'Finance', 'Real Estate', 'Concert']

min_date = dt.today().date()
max_date = dt(min_date.year, 12, 31)
max_num_events = 25

event_id = 0
df = pd.DataFrame(columns=['EventID', 'EventType', 'Lon', 'Lat', 'Date/Time'])
for date in pd.date_range(min_date, max_date, freq='d'):
    
    print(date)
    
    for _ in range(random.randint(1, max_num_events)):
        event_type = random.choice(event_types)
        
        lon = round(random.uniform(city_data['Philadelphia']['lon']['min'], city_data['Philadelphia']['lon']['max']), 6)
        lat = round(random.uniform(city_data['Philadelphia']['lat']['min'], city_data['Philadelphia']['lat']['max']), 6)
        
        date_time = date + timedelta(hours=random.randint(0, 23))
        
        row = {'EventID' : event_id, 'EventType' : event_type, 'Lon' : lon, 'Lat' : lat, 'Date/Time' : date_time}
        df = df.append(row, ignore_index=True)
        
        event_id += 1

df.to_csv(os.path.join(os.getcwd(), '..', 'data', 'sample_data.csv'), index=False)    
        
        
