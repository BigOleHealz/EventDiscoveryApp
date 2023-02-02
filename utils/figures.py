import os
from datetime import datetime as dt, timedelta
from typing import List, Mapping
from plotly import graph_objs as go
import dash_leaflet as dl

# from utils.helper_functions import get_events_by_timestamp
from utils.constants import dict_of_locations
from db.db_handler import Neo4jDB
from db import queries


icon = {
    "iconUrl": "https://leafletjs.com/examples/custom-icons/leaf-green.png",
    "shadowUrl": "https://leafletjs.com/examples/custom-icons/leaf-shadow.png",
    "iconSize": [38, 95],  # size of the icon
    "shadowSize": [50, 64],  # size of the shadow
    "iconAnchor": [
        22,
        94,
    ],  # point of the icon which will correspond to marker's location
    "shadowAnchor": [4, 62],  # the same for the shadow
    "popupAnchor": [
        -3,
        -76,
    ],  # point from which the popup should open relative to the iconAnchor
}


def figmap(neo4j_connector: Neo4jDB, date_picked: str=None, time_range: List[int]=None, location: Mapping[None, str]=None, center: list=None, zoom: int=None):
    latInitial = 39.9526
    lonInitial = -75.1652
    bearing = 0

    print(center)
    if center is None:
        center = [latInitial, lonInitial]
        
    if location:
        zoom = 15.0
        latInitial = dict_of_locations[location]["lat"]
        lonInitial = dict_of_locations[location]["lon"]
    
    if time_range is None:
        time_range = [0, 23]
    
    date_picked = dt.strptime(date_picked, "%Y-%m-%d") if date_picked else dt.today().date()
    min_timestamp = (date_picked + timedelta(hours=time_range[0]))
    min_timestamp = min_timestamp.strftime('%Y-%m-%d %H:%M:%S')
    max_timestamp = (date_picked + timedelta(hours=time_range[-1]))
    max_timestamp = max_timestamp.strftime('%Y-%m-%d %H:%M:%S')
    

    
    events = neo4j_connector.execute_query(queries.GET_EVENTS_BY_USER.format(account_id=os.environ['USER_ACCOUNT_ID'], start_ts=min_timestamp, end_ts=max_timestamp))
    
    markers = []
    for event in events:
        event_node = dict(event['event'])
        
        markers.append(
            dl.Marker(
                title=str(event_node['EventName']),
                position=(event_node['Lat'], event_node['Lon']),
                icon=icon,
                children=[
                    dl.Tooltip(event_node['EventName']),
                    dl.Popup(event_node['EventName']),
                ],
            )
        )
    cluster = dl.MarkerClusterGroup(id="markers", children=markers)
    
    
    
    return dl.Map(
                id='map-id',
                style={'width': '100%', 'height': '100%'},
                center=center,
                # zoom=5,
                children=[
                    dl.TileLayer(),
                    cluster
                ])

    # return go.Figure(
    #     data=[
    #         # Data for all rides based on date and time
    #         go.Scattermapbox(
    #             lat=df_events["Lat"],
    #             lon=df_events["Lon"],
    #             mode="markers",
    #             hoverinfo="lat+lon+text",
    #             text=df_events['Date/Time'].dt.hour,
    #             marker=dict(
    #                 showscale=True,
    #                 color=df_events['Date/Time'].dt.hour,
    #                 opacity=0.75,
    #                 size=15,
    #                 colorscale=[
    #                     [0, "#F4EC15"],
    #                     [0.04167, "#DAF017"],
    #                     [0.0833, "#BBEC19"],
    #                     [0.125, "#9DE81B"],
    #                     [0.1667, "#80E41D"],
    #                     [0.2083, "#66E01F"],
    #                     [0.25, "#4CDC20"],
    #                     [0.292, "#34D822"],
    #                     [0.333, "#24D249"],
    #                     [0.375, "#25D042"],
    #                     [0.4167, "#26CC58"],
    #                     [0.4583, "#28C86D"],
    #                     [0.50, "#29C481"],
    #                     [0.54167, "#2AC093"],
    #                     [0.5833, "#2BBCA4"],
    #                     [1.0, "#613099"],
    #                 ],
    #                 colorbar=dict(
    #                     title="Time of<br>Day",
    #                     x=0.93,
    #                     xpad=0,
    #                     nticks=24,
    #                     tickfont=dict(color="#d8d8d8"),
    #                     titlefont=dict(color="#d8d8d8"),
    #                     thicknessmode="pixels",
    #                 ),
    #             ),
    #         ),
    #         # Plot of important locations on the map
    #         go.Scattermapbox(
    #             lat=[dict_of_locations[i]["lat"] for i in dict_of_locations],
    #             lon=[dict_of_locations[i]["lon"] for i in dict_of_locations],
    #             mode="markers",
    #             hoverinfo="text",
    #             text=[i for i in dict_of_locations],
    #             marker=dict(size=8, color="#ffa0a0"),
    #         ),
    #     ],
    #     layout=go.Layout(
    #         autosize=True,
    #         margin=go.layout.Margin(l=0, r=35, t=0, b=0),
    #         showlegend=False,
    #         mapbox=dict(
    #             accesstoken=mapbox_access_token,
    #             center=dict(lat=latInitial, lon=lonInitial),
    #             style="dark",
    #             bearing=bearing,
    #             zoom=zoom,
    #         ),
    #         updatemenus=[
    #             dict(
    #                 buttons=(
    #                     [
    #                         dict(
    #                             args=[
    #                                 {
    #                                     "mapbox.zoom": 12,
    #                                     "mapbox.center.lon": str(dict_of_locations[location]["lon"]),
    #                                     "mapbox.center.lat": str(dict_of_locations[location]["lat"]),
    #                                     "mapbox.bearing": 0,
    #                                     "mapbox.style": "dark",
    #                                 }
    #                             ],
    #                             label="Reset Zoom",
    #                             method="relayout",
    #                         )
    #                     ]
    #                 ),
    #                 direction="left",
    #                 pad={"r": 0, "t": 0, "b": 0, "l": 0},
    #                 showactive=False,
    #                 type="buttons",
    #                 x=0.45,
    #                 y=0.02,
    #                 xanchor="left",
    #                 yanchor="bottom",
    #                 bgcolor="#323130",
    #                 borderwidth=1,
    #                 bordercolor="#6d6d6d",
    #                 font=dict(color="#FFFFFF"),
    #             )
    #         ],
    #     ),
    # )
