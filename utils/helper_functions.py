from datetime import datetime as dt
import numpy as np

from constants import df

def get_user_location():
    import geocoder
    latlng = geocoder.ip('me').latlng
    return {'Lat' : latlng[0], 'Lng' : latlng[-1]}
    

def getLatLonColor(min_timestamp: dt, max_timestamp: dt):
    " Get the Coordinates of the chosen months, dates and times "
    data_df = df[(min_timestamp <= df['Date/Time']) & (df['Date/Time'] <= max_timestamp)].reset_index(drop=True)
    return data_df
