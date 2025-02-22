import os
import pandas as pd

images_dir = os.path.join(os.getcwd(), 'assets', 'images')
LOGO_PATH = os.path.join(images_dir, 'kraken.png')
FRIENDS_ICON_PATH = os.path.join(images_dir, 'Friends.png')
EVENT_INVITES_ICON_PATH = os.path.join(images_dir, 'Notifications.png')

    
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

CITY_DATA = {
    'Philadelphia' : {
        'Lon' : {
            'center' : -75.165222,
            'min' : -75.222864,
            'max' : -75.141320
        },
        'Lat' : {
            'center' : 39.952584,
            'min' : 39.905712,
            'max' : 39.977753
        }
    }
}

DEFAULT_ZOOM = 13

datetime_format = '%Y-%m-%dT%H:%M:%S'

DATE_FORMAT = '%Y-%m-%d'
DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S'

ICON_SIZE = 80

CURRENTLY_ATTENDING_BUTTON_TEXT = "Unattend"

NOT_CURRENTLY_ATTENDING_BUTTON_TEXT = "I'm Going!!"

NOTIFICATION_LABEL_MAPPINGS = {
            'FRIEND_REQUEST' : {
                'type'         : 'Friend Request',
                'display_name' : '{first_name} {last_name}'
            },
            'INVITED' : {
                'type'         : 'Event Invitation',
                'display_name' : 'Host: {host}\nAddress: {address}\nStarts At: {starttime_ts}'
            }
        }

accept_event_invite_button_id = 'accept-notification-button'
decline_event_invite_button_id = 'decline-notification-button'


accept_friend_request_button_id = 'accept-friend-request-button'
decline_friend_request_button_id = 'decline-friend-request-button'


facebook_location_ids = {
    "philadelphia" : 101881036520836,
}

class RouteManager:
    login = '/login'
    home_page = '/home_page'
    create_account = '/create_account'
    logout = '/logout'
    success = '/success'
