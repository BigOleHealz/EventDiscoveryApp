import base64, os
from datetime import datetime as dt, timedelta

from dash import dcc, html
import dash_daq as daq
import dash_bootstrap_components as dbc
from flask_login import current_user
from py2neo import Node, Relationship

from utils.constants import dict_of_locations, LOGO_PATH, FRIENDS_ICON_PATH, EVENT_INVITES_ICON_PATH, datetime_format, accept_event_invite_button_id, decline_event_invite_button_id, accept_friend_request_button_id, decline_friend_request_button_id
from ui.map_handler import get_map_content
from utils.helper_functions import format_decode_image
from db.db_handler import Neo4jDB
from db import queries


class Components:
    def __init__(self, neo4j_connector: Neo4jDB):
        self.neo4j_connector = neo4j_connector
        self.event_type_mappings = self.neo4j_connector.get_event_type_mappings()
        
        self.person_friends = self.neo4j_connector.execute_query(queries.GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL.format(email=current_user.Email))
        self.friend_request_list = self.neo4j_connector.get_pending_friend_requests(email=current_user.Email)
        self.event_invite_list = self.neo4j_connector.get_pending_event_invites(email=current_user.Email)

    
    @staticmethod
    def friend_requests_div(friend_request_list: list):
        friend_requests = []
        for friend_request in friend_request_list:
            uuid = friend_request["RELATIONSHIP"]["uuid"]

            friend_requests.append(
                html.Div([
                    html.H5('Friend Request'),
                    html.Br(),
                    html.Div([
                        html.Div([
                            html.H6(f'{friend_request["NOTIFICATION_DETAILS"]["FirstName"]} {friend_request["NOTIFICATION_DETAILS"]["LastName"]}'),
                            ],
                            style={'display' : 'inline-block'}
                        ),
                        html.Div([
                            html.Button('Accept', id={'type':'friend_request_buttons', 'index': f'{accept_friend_request_button_id}_{uuid}'}, className=accept_event_invite_button_id),
                            html.Button('Decline', id={'type':'friend_request_buttons', 'index': f'{decline_friend_request_button_id}_{uuid}'}, className=decline_event_invite_button_id)
                        ],
                        style={'display' : 'inline-block'},
                        className='accept-decline-notification-div',
                        )
                    ],
                    className='notification-details-div'
                    ),
                ],
                style={"display": "block"},
                className='friend-requests-div',
                id={'type':'friend-requests-div', 'index': uuid}
                
                )
            )
            friend_requests.append(html.Hr(style={'margin' : '0px'}))
        return friend_requests


    @staticmethod
    def event_invites_div(event_invite_list: list):
        event_invites = []
        for event_invite in event_invite_list:
            
            uuid = event_invite["RELATIONSHIP"]["uuid"]
            
            event_time = dt.strptime(event_invite["NOTIFICATION_DETAILS"]["StartTimestamp"], datetime_format)
            event_invite_label_string = [html.H6(f'Host: {event_invite["NOTIFICATION_DETAILS"]["Host"]}'), \
                                        html.H6(f'Name: {event_invite["NOTIFICATION_DETAILS"]["EventName"]}'), \
                                        html.H6(f'Address: {event_invite["NOTIFICATION_DETAILS"]["Address"]}'), \
                                        html.H6(f'Date: {event_time.strftime("%Y-%m-%d")}'), \
                                        html.H6(f'Starts At: {event_time.strftime("%H:%M:%S")}')]
            
            event_invites.append(
                html.Div([
                    html.H5('Event Invite'),
                    html.Br(),
                    html.Div([
                        html.Div(event_invite_label_string,
                            style={'display' : 'inline-block'}
                        ),
                        html.Div([
                            html.Button('Accept', id={'type':'invite_buttons', 'index': f'{accept_event_invite_button_id}_{uuid}'}, className=accept_event_invite_button_id),
                            html.Button('Decline', id={'type':'invite_buttons', 'index': f'{decline_event_invite_button_id}_{uuid}'}, className=decline_event_invite_button_id)
                        ],
                        style={'display' : 'inline-block'},
                        className='accept-decline-notification-div',
                        )
                    ],
                    className='notification-details-div'
                    ),
                ],
                style={"display": "block"},
                className='event-invites-div',
                id={'type':'event-invites-div', 'index': uuid}
                
                )
            )
            event_invites.append(html.Hr(style={'margin' : '0px'}))
        return event_invites

    @property
    def header(self):
        header = dbc.Navbar(
            dbc.Container(
                [
                    html.A(
                        dbc.Row(
                            dbc.Col(dbc.NavbarBrand("")),
                            align="center",
                        ),
                        href="/",
                        style={"textDecoration": "none"},
                    ),
                    dbc.Row(
                        [
                            dbc.NavbarToggler(id="navbar-toggler"),
                            dbc.Collapse(
                                dbc.Nav(
                                    [
                                        dbc.NavItem(dbc.NavLink("Home"), className='navbar-component'),
                                        dbc.NavItem(
                                            html.Img(src=format_decode_image(path=FRIENDS_ICON_PATH),
                                                id='add-friends-button'
                                            ),
                                            className='navbar-component'
                                        ),
                                        dbc.NavItem(
                                            html.Img(src=format_decode_image(path=EVENT_INVITES_ICON_PATH),
                                                id='event-invites-button'
                                            ),
                                            className='navbar-component'
                                        ),
                                        dbc.NavItem(dbc.NavLink("Help"), className='navbar-component'),
                                        dbc.NavItem(dbc.NavLink("About"), className='navbar-component'),
                                        dbc.NavItem(dbc.NavLink('Logout', href='/logout'), className='navbar-component')
                                    ],
                                    className="w-100",
                                ),
                                id="navbar-collapse",
                                is_open=False,
                                navbar=True,
                            ),
                        ],
                    ),
                    html.Div([
                        html.Div([
                            html.Div([
                                html.Div([
                                    dbc.Alert("", id='friend-request-alert-box', color="success", dismissable=True, is_open=False),
                                    dcc.Input(placeholder='Enter the email or username of friend',
                                            className='add-friend-input',
                                            id='friend-request-input'
                                        ),
                                        dbc.Button("Send Request", id="submit-friend-request-button", className="ml-auto"),
                                ],
                                className='friend-request-subdiv'
                                ),

                            ],
                            id='search-friends-container',
                            className= 'search-friends-container'
                            ),
                            html.Div(
                                children=self.friend_requests_div(friend_request_list=self.friend_request_list),
                                id='friend-request-container',
                                className='friend-request-container'
                            )
                        ],
                        id="friends-container",
                        style={"display": "none"},
                        className='friends-container'
                        ),

                    ]),
                    
                    html.Div(
                            children=self.event_invites_div(event_invite_list=self.event_invite_list),
                            id="event-invites-container",
                            style={"display": "none"},
                            className='event-invites-container'
                        ),
                ],
                fluid=True,
            ),
            dark=True,
            color="dark",
            className='navbar'
        )
        return header

    sidebar_left = html.Div(
        [
            html.Div(
                [
                    html.Img(src=format_decode_image(path=LOGO_PATH),
                                style={"width": "15rem"},
                                alt='image'
                            )
                ],
                className="sidebar-header",
            ),
            html.Hr(),
            html.H6('Select Date'),
            dbc.Nav(
                [
                    dcc.DatePickerSingle(
                        id="date-picker",
                        date=dt.today().date(),
                        display_format="MMMM D, YYYY",
                        style={"border": "0px solid black"},
                        className="div-for-dropdown",
                    ),
                    dcc.RangeSlider(
                        min=0,
                        max=23,
                        value=[0, 23],
                        step=1,
                        marks = {str(i) : str(i) for i in range(0, 24, 3)},
                        allowCross=False,
                        id='time-slider'
                    ),
                    # Dropdown for locations on map
                    dcc.Dropdown(
                        id="location-dropdown",
                        options=[{'label': k, 'value': k} for k, _ in dict_of_locations.items()],
                        placeholder="Select a location",
                        className="div-for-dropdown",
                        value=tuple(dict_of_locations.keys())[0]
                    ),
                ],
                vertical=True,
                pills=True,
            ),
        ],
        className="sidebar-left"
    )

    @staticmethod
    def invisible_alert_box(id: str):
        return html.Div(
                    children=[html.Label(id=id)],
                    className='alert',
                    style={'visible' : False},
                )
    
    @staticmethod
    def alert_box(id: str):
        return html.Div(
                    children=[html.Label(id=id)],
                    className='alert',
                    id=id
                )
    
    @staticmethod
    def create_alert_message_child(message: str, color: str):
        return [
                    html.P(
                    message,
                    className=f"alert alert-{color}"
                )]

    def sidebar_right(self,
                    event_name: str=None,
                    event_date: str=None,
                    starttime: int=0,
                    endtime: int=23,
                    event_type_id: int=None,
                    friends_invited: list=None,
                    public_event_flag: bool=False
                ):
        
        if event_date is None:
            event_date = dt.today().date()
        if friends_invited is None:
            friends_invited = []
        return [
                html.H6('Create Event'),
                html.Hr(),
                dbc.Nav(
                    [   
                        dcc.Input(
                            id="event_name-input",
                            type="text",
                            placeholder="Input Event Name",
                            value=event_name,
                            className="component"
                        ),
                        dcc.DatePickerSingle(
                            id="event_date-picker",
                            initial_visible_month=dt.today(),
                            date=event_date,
                            display_format="MMMM D, YYYY",
                            style={"border": "0px solid black"},
                            className="component"
                        ),
                        dcc.Dropdown(
                            id="starttime-dropdown",
                            options=[{'label': t, 'value': t} for t in range(0,24)],
                            placeholder="Select a Start Time",
                            className="component",
                            value=starttime
                        ),
                        dcc.Dropdown(
                            id="endtime-dropdown",
                            options=[{'label': t, 'value': t} for t in range(0,24)],
                            placeholder="Select an End Time",
                            className="component",
                            value=endtime
                        ),
                        dcc.Dropdown(
                            id="event_type-dropdown",
                            options=[{'label': event_type['EventType'], 'value': event_type['_id']} for event_type in self.event_type_mappings],
                            className="component",
                            value=event_type_id,
                            placeholder='Event Type'
                        ),
                        dcc.Checklist(
                            id='friends_invited-checklist',
                            options=[{'label': f'{rec["FirstName"]} {rec["LastName"]}', 'value': rec['_id']} for rec in self.person_friends],
                            labelStyle={'display' : 'block'},
                            className="checklist",
                            value=friends_invited
                        ),
                        html.Button('Submit', id='submit-button', className='component'),
                        html.Hr(),
                        daq.BooleanSwitch(id='public_event-switch', label='Make This A Public Event?', on=public_event_flag),
                    ],
                    vertical=True,
                    pills=True,
                    
                ),
            ]
        
    @staticmethod
    def map_content(neo4j_connector: Neo4jDB):
        return get_map_content(neo4j_connector=neo4j_connector)

