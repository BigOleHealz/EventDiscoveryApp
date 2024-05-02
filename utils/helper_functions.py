import base64, hashlib, requests, functools, traceback, os
import time
from typing import Mapping
from urllib.parse import urlencode


from dotenv import load_dotenv
# from utils.aws_handler import AWSHandler
from utils.constants import ICON_SIZE, CITY_DATA
from utils.logger import Logger

load_dotenv()

class HelperFunctions:
    def __init__(self, logger: Logger):
        self.logger = logger
        # self.aws_handler = AWSHandler(logger=self.logger)
        self.google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    def get_lat_lon_from_address(self, address: str):
        try:
            base_url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "address": address,
                "key": self.google_maps_api_key
            }
            encoded_params = urlencode(params)
            full_url = f"{base_url}?{encoded_params}"
            
            response = requests.get(full_url)
            resp_json_payload = response.json()
            lat_lon = resp_json_payload["results"][0]["geometry"]["location"]
            return lat_lon
        except Exception as e:
            import pdb; pdb.set_trace()
            

    def get_address_from_lat_lon(self, lat: float, lon: float):
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={self.google_maps_api_key}"

        response = requests.get(url)
        resp_json_payload = response.json()
        address = resp_json_payload["results"][0]["formatted_address"]

        return address

    def get_geodata_from_venue_name(self, venue_name):
        try:
            params = {
                "address": f"{venue_name}",
                "sensor": "false",
                "region": "us",
                "key": self.google_maps_api_key,
            }

            req = requests.get(
                "https://maps.googleapis.com/maps/api/geocode/json", params=params
            )
            res = req.json()

            # Use the first result
            result = res["results"][0]

            geodata = dict()
            geodata["address"] = result["formatted_address"]
            geodata["latitude"] = result["geometry"]["location"]["lat"]
            geodata["longitude"] = result["geometry"]["location"]["lng"]

            return geodata
        except Exception as e:
            print(f"Error getting geodata from venue name: {e}")
            import pdb; pdb.set_trace()
            
            traceback.print_exc()

    def get_timezone_from_lat_lon_timestamp(self, lat: float, lon: float, timestamp: int):
        response = requests.get(f'https://maps.googleapis.com/maps/api/timezone/json?location={lat},{lon}&timestamp={timestamp}&key={self.google_maps_api_key}')

        data = response.json()
        timezone = data['timeZoneId']

        return timezone


def format_decode_image(path: str):
    return "data:image/png;base64,{}".format(
        base64.b64encode(open(path, "rb").read()).decode("ascii")
    )


def hash_password(input_string: str):
    sha256 = hashlib.sha256()
    sha256.update(input_string.encode())
    return sha256.hexdigest()


def get_device_location():
    import geocoder

    # latlng = geocoder.ip('me').latlng
    # return {'Lat' : latlng[0], 'Lng' : latlng[-1]}
    return {
        "Lat": CITY_DATA["Philadelphia"]["Lat"]["center"],
        "Lon": CITY_DATA["Philadelphia"]["Lon"]["center"],
    }
