import os
import pandas as pd

LOGO_PATH = os.path.join(os.getcwd(), 'assets', 'images', 'kraken.png')

    
# Dictionary of important locations in Philly
dict_of_locations = {
    "City Hall": {"lat": 39.952433, "lon": -75.163800},
    "Art Museum": {"lat": 39.965257, "lon": -75.180456},
    "30th St Station": {"lat": 39.955583, "lon": -75.181715},
    "Liberty Bell": {"lat": 39.949685, "lon": -75.150553},
    "Citizen's Bank Park": {"lat": 39.905730, "lon": -75.166501},
    "Wells Fargo Center": {"lat": 39.901280, "lon": -75.171783},
    "Lincoln Financial Fields": {"lat": 39.900805, "lon": -75.167436},
    "The Met - Philadelphia": {"lat": 39.969672, "lon": -75.160099},
}

datetime_format = '%Y-%m-%dT%H:%M:%S'

ICON_SIZE = 80

CURRENTLY_ATTENDING_BUTTON_TEXT = "Unattend"

NOT_CURRENTLY_ATTENDING_BUTTON_TEXT = "I'm Going!!"
