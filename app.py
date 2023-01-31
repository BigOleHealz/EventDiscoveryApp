#!/usr/bin/python3

import os
from datetime import datetime as dt, timedelta
from typing import List, Mapping

from dash import Dash, dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

from utils.figures import figmap
from utils.components import Components
from db.db_handler import Neo4jDB


app = Dash(__name__, title = "Event Finder", external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME])
server = app.server

neo4j = Neo4jDB()
components = Components(neo4j_db_connector=neo4j)

# Layout of Dash App
app.layout = html.Div(
    children=[
        dbc.Popover(target="right_sidebar", trigger="hover", id="popover"),
        # html.Div(children=components.alerts(), id="alerts", className='alert'),
        dcc.Location(id="url"),
        components.header,
        components.sidebar_left,
        html.Div(children=components.sidebar_right(),
                id="right_sidebar",
                className="sidebar-right"
                ),
        components.map_content
    ]
)

@callback(
    Output("map-graph", "figure"),
    Input("date-picker", "date"),
    Input("time-slider", "value"),
    Input("location-dropdown", "value")
)
def update_graph(date_picked: str, time_range: List[int], location: Mapping[None, str]):
    " Update Map Graph based on date-picker, selected data on histogram and location dropdown "
    return figmap(date_picked, time_range, location)


@callback(
    Output("right_sidebar", "style"),
    Input("popover", "is_open")
)
def right_sidebar_style(popover: bool=False):
    return {'width' : '16rem'} if popover is True else {'width' : '5rem'}

@callback(
    # [
    Output("right_sidebar", "children"),
    # Output("alerts", "children")
    # ],
    [Input("event_name-input", "value"),
    Input("event_date-setter", "date"),
    Input("starttime-dropdown", "value"),
    Input("endtime-dropdown", "value"),
    Input("event_type-dropdown", "value"),
    Input("friends_invited-checklist", "value"),
    Input("submit-button", "n_clicks")]
)
def create_event(event_name: str, event_date: str, starttime: int, endtime: int, event_type_id: int, friends_invited: List[int], n_clicks: int):
    # your code for inserting the record into the database
    
    required_args = [event_name, event_type_id]
    event_date_dt = dt.strptime(event_date, '%Y-%m-%d')
        
    start_ts = (event_date_dt + timedelta(hours=starttime)).strftime('%Y-%m-%d %H:%M:%S')
    end_ts = (event_date_dt + timedelta(hours=endtime)).strftime('%Y-%m-%d %H:%M:%S')
    
    if n_clicks is not None:
        if all([val is not None for val in required_args]):
            created_at = dt.now().strftime('%Y-%m-%d %H:%M:%S')
            properties = {'CreatedByID': int(os.environ['USER_ACCOUNT_ID']), 'EventName' : event_name, 'StartTimestamp' : start_ts, 'EndTimestamp' : end_ts, 'EventTypeID' : event_type_id, 'CreatedAt': created_at}
            
            neo4j.create_event(properties=properties, friends_invited=friends_invited)
                
            return components.sidebar_right() # , None
        elif any([val is None for val in required_args]):
            return components.sidebar_right(event_name=event_name, event_date=event_date, starttime=starttime, endtime=endtime, event_type_id=event_type_id, friends_invited=friends_invited) # , ["All fields are required"]
            
        else:
            return components.sidebar_right(event_name=event_name, event_date=event_date, starttime=starttime, endtime=endtime, event_type_id=event_type_id, friends_invited=friends_invited) # , None
    else:
        return components.sidebar_right(event_name=event_name, event_date=event_date, starttime=starttime, endtime=endtime, event_type_id=event_type_id, friends_invited=friends_invited)# , None


if __name__ == "__main__":
    app.run_server(debug=True)
