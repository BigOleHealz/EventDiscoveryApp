#!/usr/bin/python3

import os, traceback, sys
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from dash import Dash, dcc, html, Input, Output, State, callback, callback_context, MATCH
import dash_bootstrap_components as dbc

from utils.components import Components
from utils.logger import Logger
from db.db_handler import Neo4jDB
from utils.map_handler import tile_layer
from utils.callback_functions import callback_create_event, callback_attend_event


logger = Logger(name=__file__)
app = Dash(__name__,
            title="Event Finder",
            external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME]
        )
logger.info("Dash app initialized")

neo4j = Neo4jDB(logger=logger)
session_account_node = neo4j.get_account_node_by_email(email=os.environ['ACCOUNT_EMAIL'])
components = Components(neo4j_connector=neo4j)

app.layout = html.Div(
    children=[
        components.alert_box,
        dcc.Location(id="url"),
        components.header,
        components.sidebar_left,
        html.Div(components.sidebar_right(),
                id="right_sidebar",
                className="sidebar-right"
            ),
        components.map_content(neo4j_connector=neo4j),
        html.Div(id='coordinate-click-id')
    ]
)

@callback(
    [
        Output("right_sidebar", "children"),
        Output("alert_box", "children"),
        Output("map-id", "children")
    ],
    [
        # Filter events args (left sidebar)
        Input("date-picker", "date"),
        Input("time-slider", "value"),
        Input("location-dropdown", "value"),

        # Create event args (right sidebar)
        Input("event_name-input", "value"),
        Input("event_date-picker", "date"),
        Input("starttime-dropdown", "value"),
        Input("endtime-dropdown", "value"),
        Input("event_type-dropdown", "value"),
        Input("friends_invited-checklist", "value"),
        Input("public_event-switch", "on"),
        Input("map-id", "click_lat_lng"),
        Input("submit-button", "n_clicks")
    ]
)
def update_map(*args, **kwargs):
    logger.debug(f'Running {sys._getframe().f_code.co_name}')
    
    (date_picked, time_range, selected_location, event_name, event_date, starttime, endtime, event_type_id, friends_invited, public_event_flag, click_lat_lng, n_clicks) = args
    
    # callback_create_event must come before tile_layer refresh so that database is updated before 
    return *callback_create_event(
                        neo4j_connector=neo4j,
                        session_account_node=session_account_node,
                        event_name=event_name,
                        event_date=event_date,
                        starttime=starttime,
                        endtime=endtime,
                        event_type_id=event_type_id,
                        friends_invited=friends_invited,
                        public_event_flag=public_event_flag,
                        click_lat_lng=click_lat_lng,
                        n_clicks=n_clicks
                    ), tile_layer(
                        neo4j_connector=neo4j, 
                        date_picked=date_picked,
                        time_range=time_range,
                        selected_location=selected_location
                    )
                
    
        
        


@callback(
        Output({'type': 'buttons', 'index': MATCH}, 'children'),
        Input({'type': 'buttons', 'index': MATCH}, 'n_clicks'),
        Input({'type': 'buttons', 'index': MATCH}, 'children'),
        State({'type': 'buttons', 'index': MATCH}, 'id')
    )
def attend_event(*args, **kwargs):
    logger.debug(f'Running {sys._getframe().f_code.co_name}')
    return callback_attend_event(
                                neo4j,
                                session_account_node, # remove after session works
                                *args,
                                **kwargs
                            )
    



if __name__ == "__main__":
    app.run_server('0.0.0.0', port=8051, debug=True)
