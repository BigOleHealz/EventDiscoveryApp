import os, traceback, sys
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from py2neo import Node
from flask_login import current_user
from dash import Input, Output, State, callback, no_update

from db.db_handler import Neo4jDB
from ui.components import Components
from utils.helper_functions import get_address_from_lat_lon
from ui.layouts import LayoutHandler
from ui.map_handler import tile_layer
from utils.constants import CURRENTLY_ATTENDING_BUTTON_TEXT, NOT_CURRENTLY_ATTENDING_BUTTON_TEXT, datetime_format, RouteManager as routes



def create_event(neo4j_connector: Neo4jDB,
                event_name: str,
                event_date: str,
                starttime: int,
                endtime: int,
                event_type_id: int,
                friends_invited: list,
                public_event_flag: bool,
                click_lat_lng: list=None,
                n_clicks: int=None
            ):
    
    components = Components(neo4j_connector=neo4j_connector)
    
    required_args = [event_name, click_lat_lng, event_type_id]
    event_date_dt = dt.strptime(event_date, '%Y-%m-%d')
        
    start_ts = (event_date_dt + timedelta(hours=starttime)).strftime(datetime_format)
    end_ts = (event_date_dt + timedelta(hours=endtime)).strftime(datetime_format)
    
    if n_clicks is not None:
        if all([val is not None for val in required_args]):
            created_at = dt.now().strftime(datetime_format)
            latitude, longitude = click_lat_lng[0], click_lat_lng[-1]
            
            properties = {
                            'CreatedByID'    : current_user.identity,
                            'EventName'      : event_name,
                            'StartTimestamp' : start_ts,
                            'EndTimestamp'   : end_ts,
                            'EventTypeID'    : event_type_id,
                            'CreatedAt'      : created_at,
                            'PublicEventFlag': public_event_flag,
                            'Host'           : current_user.Name,
                            'Lat'            : latitude,
                            'Lon'            : longitude,
                            'Address'        : get_address_from_lat_lon(lat=latitude, lon=longitude),
                            'EventCreatedAt' : dt.now().strftime(datetime_format)
                        }

            node = neo4j_connector.create_event_with_relationships(creator_node=current_user.node, properties=properties, friends_invited=friends_invited)
            return components.sidebar_right(), components.create_alert_message_child(message="Successfully created Event!", color='success')
        
        else:
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
                ), []


def attend_event(neo4j_connector: Neo4jDB,
                            current_user: Node,
                            n_clicks: int,
                            button_value: str,
                            button_data: dict
                        ):
    if n_clicks is not None:
        if button_value == CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.delete_attending_relationship(attendee_node_id=current_user.identity, event_node_id=button_data['index'])
            return NOT_CURRENTLY_ATTENDING_BUTTON_TEXT
        elif button_value == NOT_CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.create_attending_relationship_by_id(attendee_node_id=current_user.identity, event_node_id=button_data['index'])
            return CURRENTLY_ATTENDING_BUTTON_TEXT
        else:
            raise Exception(traceback.format_exc())
    else:
        return button_value


@callback(
            Output('login-status', 'data'),
            [Input('url', 'pathname')]
        )
def login_status(url):
    ''' callback to display login/logout link in the header '''
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated \
            and url != routes.logout:  # If the URL is /logout, then the user is about to be logged out anyways
        return current_user.identity
    else:
        return 'loggedout'

def callback_attend_event(neo4j_connector: Neo4jDB,
                            session_account_node: Node,  # remove after session works
                            n_clicks: int,
                            value: str,
                            button_data: dict
                        ):
    if n_clicks is not None:
        if value == CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.delete_attending_relationship(attendee_node_id=session_account_node.identity, event_node_id=button_data['index'])
            return NOT_CURRENTLY_ATTENDING_BUTTON_TEXT
        elif value == NOT_CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.create_attending_relationship_by_id(attendee_node_id=session_account_node.identity, event_node_id=button_data['index'])
            return CURRENTLY_ATTENDING_BUTTON_TEXT
        else:
            raise Exception(traceback.format_exc())
    else:
        return value


@callback(
    Output("modal", "is_open"),
    [Input("create-account-button", "n_clicks"),
     Input("close-modal-button", "n_clicks"),
     Input("submit-interests-button", "n_clicks")],
    [State("modal", "is_open")],
)
def toggle_modal(n1, n2, submit_button_clicks, is_open):
    if n1 or n2:
        return not is_open
    return is_open


def toggle_container(style: dict, n_clicks: int):
    if n_clicks is None:
        return style, None
    else:
        if style["display"] == "none":
            return {"display": "block"}, n_clicks
        else:
            return {"display": "none"}, n_clicks
    
@callback(
    Output("friends-container", "style"),
    Output("add-friends-button", "n_clicks"),

    State("friends-container", "style"),
    Input("add-friends-button", "n_clicks"),
    prevent_initial_call=True
)
def toggle_add_friends_container(style: dict, n_clicks: int):
        return toggle_container(style=style, n_clicks=n_clicks)


@callback(
    Output('event-invites-container', 'style'),
    Output('event-invites-button', 'n_clicks'),

    State('event-invites-container', 'style'),
    Input('event-invites-button', 'n_clicks'),
    prevent_initial_call=True
)
def toggle_event_invites_container(style: dict, n_clicks: int):
        return toggle_container(style=style, n_clicks=n_clicks)
