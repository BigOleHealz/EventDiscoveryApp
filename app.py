#!/usr/bin/python3

import os
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from dash import Dash, dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

from utils.figures import figmap
from utils.components import Components
from db.db_handler import Neo4jDB
from db import queries


app = Dash(__name__,
            title="Event Finder",
            external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME],
            external_scripts=['https://codepen.io/chriddyp/pen/bWLwgP.css']
        )
server = app.server

neo4j = Neo4jDB()
components = Components(neo4j_db_connector=neo4j)

# Layout of Dash App
app.layout = html.Div(
    children=[
        dbc.Popover(target="right_sidebar", trigger="hover", id="popover"),
        components.alert_box,
        dcc.Location(id="url"),
        components.header,
        components.sidebar_left,
        html.Div(children=components.sidebar_right(),
                id="right_sidebar",
                className="sidebar-right"
                ),
        components.map_content,
        html.Div(id='coordinate-click-id')
    ]
)

@app.callback(
        Output('map-id', 'children'),
        Input("date-picker", "date"),
        Input("time-slider", "value"),
        Input("location-dropdown", "value"),
        Input('map-id', 'center'),
        Input('map-id', 'zoom')
)
def click_coord(date_picked: str, time_range: List[int], location: Mapping[None, str], center: list, zoom: int):
    return figmap(
                    neo4j_connector=neo4j,
                    date_picked=date_picked,
                    time_range=time_range,
                    location=location,
                    center=center
                )


@callback(
    Output("right_sidebar", "style"),
    Input("popover", "is_open")
)
def right_sidebar_style(popover: bool=False):
    return {'width' : '16rem'} if popover is True else {'width' : '5rem'}

@callback(
    [Output("right_sidebar", "children"),
    Output("alert_box", "children")],
    [Input("event_name-input", "value"),
    Input("event_date-picker", "date"),
    Input("starttime-dropdown", "value"),
    Input("endtime-dropdown", "value"),
    Input("event_type-dropdown", "value"),
    Input("friends_invited-checklist", "value"),
    Input("public_event-switch", "on"),
    Input("submit-button", "n_clicks")]
)
def create_event(*args, **kwargs):
    event_name, event_date, starttime, endtime, event_type_id, friends_invited, public_event_flag, n_clicks = args
    required_args = [event_name, event_type_id]
    event_date_dt = dt.strptime(event_date, '%Y-%m-%d')
        
    start_ts = (event_date_dt + timedelta(hours=starttime)).strftime('%Y-%m-%d %H:%M:%S')
    end_ts = (event_date_dt + timedelta(hours=endtime)).strftime('%Y-%m-%d %H:%M:%S')
    
    if n_clicks is not None:
        if all([val is not None for val in required_args]):
            created_at = dt.now().strftime('%Y-%m-%d %H:%M:%S')
            properties = {
                            'CreatedByID': int(os.environ['USER_ACCOUNT_ID']),
                            'EventName' : event_name,
                            'StartTimestamp' : start_ts,
                            'EndTimestamp' : end_ts,
                            'EventTypeID' : event_type_id,
                            'CreatedAt': created_at,
                            'PublicEvent' : public_event_flag
                        }
            neo4j.create_event(properties=properties, friends_invited=friends_invited)
            return components.sidebar_right(), components.create_alert_message_child(message="Successfully created Event!", color='success')
        
        elif any([val is None for val in required_args]):
            return components.sidebar_right(event_name=event_name,
                                            event_date=event_date,
                                            starttime=starttime,
                                            endtime=endtime,
                                            event_type_id=event_type_id,
                                            friends_invited=friends_invited,
                                            public_event_flag=public_event_flag
                    ), components.create_alert_message_child(message="All fields are required", color='danger')
        else:
            return components.sidebar_right(event_name=event_name,
                                            event_date=event_date,
                                            starttime=starttime,
                                            endtime=endtime,
                                            event_type_id=event_type_id,
                                            friends_invited=friends_invited,
                                            public_event_flag=public_event_flag
                    ), None
    else:
        return components.sidebar_right(event_name=event_name,
                                        event_date=event_date,
                                        starttime=starttime,
                                        endtime=endtime,
                                        event_type_id=event_type_id,
                                        friends_invited=friends_invited,
                                        public_event_flag=public_event_flag
                ), None


if __name__ == "__main__":
    app.run_server(debug=True)
