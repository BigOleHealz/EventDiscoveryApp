import base64, hashlib, requests, functools, traceback
from typing import Mapping

from PIL import Image

from utils.aws_handler import AWSHandler
from utils.constants import ICON_SIZE, CITY_DATA
from utils.logger import Logger


class HelperFunctions:
    def __init__(self, logger: Logger):
        self.logger = logger
        self.aws_handler = AWSHandler(logger=self.logger)
        self.google_maps_api_key = self.aws_handler.get_secret('google_maps_api_key')['GOOGLE_MAPS_API_KEY']


    def get_lat_lon_from_address(self, address: str):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={self.google_maps_api_key}"
        response = requests.get(url)
        resp_json_payload = response.json()
        lat_lon = resp_json_payload['results'][0]['geometry']['location']
        return lat_lon

    def get_address_from_lat_lon(self, lat: float, lon: float):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={self.google_maps_api_key}"
        
        response = requests.get(url)
        resp_json_payload = response.json()
        address = resp_json_payload['results'][0]['formatted_address']
            
        return address


def format_decode_image(path: str):
    return 'data:image/png;base64,{}'.format(base64.b64encode(open(path, 'rb').read()).decode('ascii'))

def hash_password(input_string: str):
    sha256 = hashlib.sha256()
    sha256.update(input_string.encode())
    return sha256.hexdigest()

def get_scaled_dimensions(image_path: str):
    image = Image.open(image_path)
    width, height = image.size
    
    if height > width:
        return (int(ICON_SIZE * width / height), ICON_SIZE)
    else:
        return (ICON_SIZE, int(ICON_SIZE * width / height))

def get_device_location():
    import geocoder
    # latlng = geocoder.ip('me').latlng
    # return {'Lat' : latlng[0], 'Lng' : latlng[-1]}
    return {'Lat' : CITY_DATA['Philadelphia']['Lat']['center'], 'Lon' : CITY_DATA['Philadelphia']['Lon']['center']}
