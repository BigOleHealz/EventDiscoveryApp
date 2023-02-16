import base64, os
from datetime import datetime as dt, timedelta

from dash import dcc, html
import dash_daq as daq
import dash_bootstrap_components as dbc

from utils.constants import dict_of_locations, LOGO_PATH, FRIENDS_ICON_PATH, NOTIFICATIONS_ICON_PATH
from ui.map_handler import get_map_content
from utils.helper_functions import format_decode_image
from db.db_handler import Neo4jDB
from db import queries

print(FRIENDS_ICON_PATH)
encoded_img = base64.b64encode(open(FRIENDS_ICON_PATH, 'rb').read()).decode('ascii')

class Components:
    def __init__(self, neo4j_connector: Neo4jDB):
        self.neo4j_connector = neo4j_connector
        self.event_type_mappings = self.neo4j_connector.get_event_type_mappings()
        
        self.person_friends = self.neo4j_connector.execute_query(queries.GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL.format(email=os.environ['ACCOUNT_EMAIL']))
    
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
                                    dbc.NavItem(dbc.NavLink("Home")),
                                    dbc.NavItem(
                                        html.Img(src=format_decode_image(path=FRIENDS_ICON_PATH),
                                            style={'margin' : '5px'}
                                        )
                                    ),
                                    dbc.NavItem(dbc.NavLink("Help")),
                                    dbc.NavItem(dbc.NavLink("About")),
                                    dbc.NavItem(dbc.NavLink('Logout', href='/logout'))
                                ],
                                className="w-100",
                            ),
                            id="navbar-collapse",
                            is_open=False,
                            navbar=True,
                        ),
                    ],
                ),
            ],
            fluid=True,
        ),
        dark=True,
        color="dark",
    )

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
                            options=[{'label': event_type['EventName'], 'value': event_type['_id']} for event_type in self.event_type_mappings],
                            className="component",
                            value=event_type_id,
                            placeholder='Event Type'
                        ),
                        dcc.Checklist(
                            id='friends_invited-checklist',
                            options=[{'label': rec['Name'], 'value': rec['_id']} for rec in self.person_friends],
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

