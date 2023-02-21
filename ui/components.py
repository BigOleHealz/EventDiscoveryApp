import base64, os
from datetime import datetime as dt, timedelta

from dash import dcc, html
import dash_daq as daq
import dash_bootstrap_components as dbc
from flask_login import current_user
from py2neo import Node, Relationship

from utils.constants import dict_of_locations, LOGO_PATH, FRIENDS_ICON_PATH, NOTIFICATIONS_ICON_PATH, NOTIFICATION_LABEL_MAPPINGS, datetime_format, accept_invite_button_id, decline_invite_button_id
from ui.map_handler import get_map_content
from utils.helper_functions import format_decode_image
from db.db_handler import Neo4jDB
from db import queries


class Components:
    def __init__(self, neo4j_connector: Neo4jDB):
        self.neo4j_connector = neo4j_connector
        self.event_type_mappings = self.neo4j_connector.get_event_type_mappings()
        
        self.person_friends = self.neo4j_connector.execute_query(queries.GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL.format(email=current_user.Email))
        self.notifications_list = self.neo4j_connector.get_pending_event_invites(email=current_user.Email)

    @staticmethod
    def notifications_div(notifications_list: list):
        notifications = []
        for notification in notifications_list:
            
            uuid = notification["RELATIONSHIP"]["UUID"]
            
            # if notification['NOTIFICATION_TYPE'] == 'FRIEND_REQUEST':
            #     notification_label_string = NOTIFICATION_LABEL_MAPPINGS[notification['NOTIFICATION_TYPE']]['display_name'].format(
            #                                                 first_name=notification['NOTIFICATION_DETAILS']['FirstName'],
            #                                                 last_name=notification['NOTIFICATION_DETAILS']['LastName'])
            # elif notification['NOTIFICATION_TYPE'] == 'INVITED':
            event_time = dt.strptime(notification["NOTIFICATION_DETAILS"]["StartTimestamp"], datetime_format)
            notification_label_string = html.H6(f'Host: {notification["NOTIFICATION_DETAILS"]["Host"]}'), \
                                        html.H6(f'Name: {notification["NOTIFICATION_DETAILS"]["EventName"]}'), \
                                        html.H6(f'Address: {notification["NOTIFICATION_DETAILS"]["Address"]}'), \
                                        html.H6(f'Date: {event_time.strftime("%Y-%m-%d")}'), \
                                        html.H6(f'Starts At: {event_time.strftime("%H:%M:%S")}')
                                            
            
            notifications.append(
                html.Div([
                    html.H5(NOTIFICATION_LABEL_MAPPINGS[notification['NOTIFICATION_TYPE']]['type']),
                    html.Br(),
                    html.Div([
                        html.Div([
                            html.Label(notification_label_string,
                                   id='notifications-label',
                                   style={'width' : '20vh'}),
                            ],
                            style={'display' : 'inline-block'}
                        ),
                        html.Div([
                            html.Button('Accept', id={'type':'invite_buttons', 'index': f'{accept_invite_button_id}_{uuid}'}, className=accept_invite_button_id),
                            html.Button('Decline', id={'type':'invite_buttons', 'index': f'{decline_invite_button_id}_{uuid}'}, className=decline_invite_button_id)
                        ],
                        style={'display' : 'inline-block'},
                        className='accept-decline-notification-div',
                        )
                    ],
                    className='notification-details-div'
                    ),
                ],
                style={"display": "block"},
                className='notifications-div',
                id={'type':'event_invite_div', 'index': uuid}
                
                )
            )
            notifications.append(html.Hr(style={'margin' : '0px'}))
        return notifications
    
            
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
                                            html.Img(src=format_decode_image(path=NOTIFICATIONS_ICON_PATH),
                                                id='add-notifications-button'
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
                    html.Div(
                        [
                            dbc.Alert("", id='friend-request-alert-box', color="success", dismissable=True, is_open=False),
                            dcc.Input(placeholder='Enter the email or username of friend',
                                    className='default-input-style',
                                    id='friend-request-input'
                                ),
                            dbc.Button("Send Request", id="submit-friend-request-button", className="ml-auto"),
                        ],
                        id="add-friends-container",
                        style={"display": "none"},
                        className='add-friends-container'
                    ),
                    
                    html.Div(
                            children=self.notifications_div(notifications_list=self.notifications_list),
                            id="notifications-container",
                            style={"display": "none"},
                            className='notifications-container'
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

