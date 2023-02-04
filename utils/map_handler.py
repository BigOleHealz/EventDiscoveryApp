import os
from datetime import datetime as dt, timedelta
from typing import List, Mapping
from dash import html, dcc
import dash_leaflet as dl

from utils.helper_functions import get_scaled_dimensions
from db.db_handler import Neo4jDB
from db import queries
from utils.constants import datetime_format

date_output_format = '%Y-%m-%d %H:%M:%S'


icon_paths = {
    "Bars": "assets/images/Bars.png",
    "Crypto": "assets/images/Crypto.png",
    "Food": "assets/images/Food.png",
    "Golf": "assets/images/Golf.png",
    "Music": "assets/images/Music.png",
    "Professional": "assets/images/Professional.png",
    "Sports": "assets/images/Sports.png",
    }
icon_mappings = {key : {'iconUrl' : val} for key, val in icon_paths.items()}
for key, val in icon_paths.items():
    width, height = get_scaled_dimensions(image_path=val)
    icon_mappings[key]['iconSize'] = [width, height]
    icon_mappings[key]["iconAnchor"] = [width // 2, height],
    icon_mappings[key]["popupAnchor"] = [0, 0]

print(icon_mappings)
def tile_layer(neo4j_connector: Neo4jDB,
            date_picked: str=None,
            time_range: List[int]=None,
            location: Mapping[None, str]=None,
        ):
    
    if time_range is None:
        time_range = [0, 23]
    
    date_picked = dt.strptime(date_picked, "%Y-%m-%d") if date_picked else dt.today().date()
    
    min_timestamp = (date_picked + timedelta(hours=time_range[0])).strftime(datetime_format)
    max_timestamp = (date_picked + timedelta(hours=time_range[-1])).strftime(datetime_format)

    events = neo4j_connector.execute_query(queries.GET_EVENT_BY_USER_AND_TS.format(account_id=os.environ['USER_ACCOUNT_ID'], start_ts=min_timestamp, end_ts=max_timestamp))
    
    markers = []
    for event in events:
        event_node = event['Event']
        attendee_count = event['AttendeeCount']
        
        event_name_str = f"Event Name: {event_node['EventName']}"
        event_host_str = f"Host: {event_node['Host']}"
        address_str = f"Address: {event_node['Address']}"
        
        markers.append(
            dl.Marker(
                position=(event_node['Lat'], event_node['Lon']),
                icon=icon_mappings[event['EventName']],
                children=[
                    dl.Tooltip(
                        children=[
                            html.Div(children=[
                                html.H1(event_name_str),
                                html.P(event_host_str),
                                html.P(address_str),
                                html.P(f"Current People Attending: {attendee_count}")
                            ])
                        ],
                        className='sticky-tooltip',
                    ),
                    dl.Popup(
                            html.Div(children=[
                                    html.P(event_name_str),
                                    html.P(event_host_str),
                                    html.P(address_str),
                                    html.Button("I'm Going!!", id='test-button')
                                ]
                            )
                        ),
                ],
            )
        )
    cluster = dl.MarkerClusterGroup(id="markers", children=markers)
    
    layer_control = dl.LayersControl([
                                        dl.BaseLayer(
                                            dl.TileLayer(url='https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', id='tile-layer'),
                                            checked=True,
                                        ),
                                    ])

    return [layer_control, cluster]

def get_map_content(neo4j_connector: Neo4jDB):
    return html.Div(
                className="eight columns div-for-charts bg-grey",
                children=[
                    dl.Map(
                        id='map-id',
                        style={'width': '100%', 'height': '95%'},
                        center=[39.9526, -75.1652],
                        zoom=13,
                        children=tile_layer(neo4j_connector=neo4j_connector)
                    )]
                )
