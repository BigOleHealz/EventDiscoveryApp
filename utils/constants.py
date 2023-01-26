import os
import pandas as pd

LOGO_PATH = os.path.join(os.getcwd(), 'assets', 'images', 'kraken.png')

# Plotly mapbox public token
mapbox_access_token_filename = 'mapbox_access_token.txt'
if mapbox_access_token_filename in os.listdir(os.getcwd()):
    with open(os.path.join(os.getcwd(), mapbox_access_token_filename), 'r') as file:
        mapbox_access_token = file.read()
else:
    raise FileNotFoundError('''mapbox_access_token.txt does not exist in root directory. Go to mapbox.com to create an account,
                            get an API key, and paste it in a file named "mapbox_access_token.txt" in the root directory of this project''')
    
# Dictionary of important locations in New York
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

df = pd.read_csv(os.path.join(os.getcwd(), 'Testing', 'data', 'sample_data.csv'), dtype={'EventID' : int, 'Lon' : float, 'Lat' : float})
df["Date/Time"] = pd.to_datetime(df["Date/Time"], format="%Y-%m-%d %H:%M")
