import os
from datetime import datetime as dt, timedelta
from typing import List, Mapping
from dash import Dash, html, dcc, Input, Output, callback
import dash_leaflet as dl

from utils.helper_functions import get_scaled_dimensions
from db.db_handler import Neo4jDB
from db import queries
from utils.constants import datetime_format, CURRENTLY_ATTENDING_BUTTON_TEXT, NOT_CURRENTLY_ATTENDING_BUTTON_TEXT

def write_query_to_file(query: str):
    with open('Testing/recent_query.cypher', 'w') as file:
        file.write(query)

icon_paths = {
        "Bars"         : "assets/images/Bars.png",
        "Crypto"       : "assets/images/Crypto.png",
        "Food"         : "assets/images/Food.png",
        "Golf"         : "assets/images/Golf.png",
        "Music"        : "assets/images/Music.png",
        "Professional" : "assets/images/Professional.png",
        "Sports"       : "assets/images/Sports.png",
    }
icon_mappings = {key : {'iconUrl' : val} for key, val in icon_paths.items()}
for key, val in icon_paths.items():
    width, height = get_scaled_dimensions(image_path=val)
    icon_mappings[key]['iconSize'] = [width, height]
    icon_mappings[key]["iconAnchor"] = [width // 2, height],
    icon_mappings[key]["popupAnchor"] = [width // 2, 0]

def tile_layer(
            neo4j_connector: Neo4jDB,
            date_picked: str=None,
            time_range: List[int]=None,
            selected_location: Mapping[None, str]=None,
        ):
    
    if time_range is None:
        time_range = [0, 23]

    date_picked = dt.strptime(date_picked, "%Y-%m-%d") if date_picked else dt.combine(dt.today(), dt.min.time())
    
    min_timestamp = (date_picked + timedelta(hours=time_range[0])).strftime(datetime_format)
    max_timestamp = (date_picked + timedelta(hours=time_range[-1])).strftime(datetime_format)

    write_query_to_file(queries.GET_EVENT_BY_PERSON_AND_TS.format(email=os.environ['ACCOUNT_EMAIL'], start_ts=min_timestamp, end_ts=max_timestamp))
    events = neo4j_connector.execute_query(queries.GET_EVENT_BY_PERSON_AND_TS.format(email=os.environ['ACCOUNT_EMAIL'], start_ts=min_timestamp, end_ts=max_timestamp))
    
    markers = []
    for i, event in enumerate(events):
        event_node = event['Event']
        attendee_count = event['AttendeeCount']
        
        attending_boolean = event['ATTENDING_BOOLEAN']
        
        event_name_str = f"Event Name: {event_node['EventName']}"
        event_host_str = f"Host: {event_node['Host']}"
        address_str = f"Address: {event_node['Address']}"
        
        if attending_boolean:
            attend_button = html.Button(CURRENTLY_ATTENDING_BUTTON_TEXT, id={'type':'buttons', 'index':event_node.identity})
        else:
            attend_button = html.Button(NOT_CURRENTLY_ATTENDING_BUTTON_TEXT, id={'type':'buttons', 'index':event_node.identity})
        
        
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
                        className='custom-tooltip',
                        sticky=True
                    ),
                    dl.Popup(
                            html.Div(children=[
                                html.P(event_name_str),
                                html.P(event_host_str),
                                html.P(address_str),
                                html.Div([html.P(f"Current People Attending: "), html.P(attendee_count)]),
                                attend_button
                            ]
                        ),
                        className='custom-map-popup'
                    ),
                ],
            )
        )
    cluster = dl.MarkerClusterGroup(id="markers", children=markers)
    
    layer_control = dl.LayersControl([
                                        dl.BaseLayer(
                                            dl.TileLayer(
                                                url='https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                                                id='tile-layer'
                                            ),
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
