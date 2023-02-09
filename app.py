#!/usr/bin/python3

import os, traceback, sys, secrets
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from flask import Flask
from flask_login import login_user, LoginManager, logout_user, current_user
from dash import Dash, dcc, html, Input, Output, State, callback, callback_context, MATCH, no_update
import dash_bootstrap_components as dbc

from utils.layouts import LayoutHandler
from utils.entities import Account
from utils.components import Components
from utils.logger import Logger
from db.db_handler import Neo4jDB
from utils.map_handler import tile_layer
from utils.callback_functions import callback_create_event, callback_attend_event


logger = Logger(name=__file__)

server = Flask(__name__)
app = Dash(__name__,
            server=server,
            title="Event Finder",
            external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME],
            suppress_callback_exceptions=True
        )
logger.info("Dash app initialized")

server.config.update(SECRET_KEY=secrets.token_hex(24))

login_manager = LoginManager()
login_manager.init_app(server)
login_manager.login_view = '/login'

neo4j = Neo4jDB(logger=logger)

app.layout = html.Div(
    children=[
        Components.alert_box,
        dcc.Location(id='url', refresh=False),
        dcc.Location(id='redirect', refresh=True),
        dcc.Store(id='login-status', storage_type='session'),
        html.Div(id='user-status-div'),
        html.Div(id='page-content'),
    ]
)

@ login_manager.user_loader
def load_user(node_id: str):
    return Account(neo4j.get_account_node(node_id=node_id))


@callback(
            Output('login-status', 'data'),
            [Input('url', 'pathname')]
        )
def login_status(url):
    ''' callback to display login/logout link in the header '''
    if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated \
            and url != '/logout':  # If the URL is /logout, then the user is about to be logged out anyways
        return current_user.identity
    else:
        return 'loggedout'


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
                        session_account_node=current_user,
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
                                current_user, # remove after session works
                                *args,
                                **kwargs
                            )


@callback(
    Output('url_login', 'pathname'),
    Output('output-state', 'children'),
    [Input('login-button', 'n_clicks')],
    [State('uname-box', 'value'),
     State('pwd-box', 'value')])
def login_button_click(n_clicks: int, email: str, password: str):
    if n_clicks > 0:
        (account_node, auth_status) = neo4j.authenticate_account(email=email, password=password)
        
        if auth_status == 'Success':
            account = Account(account_node)
            login_user(account)
            return '/main_app', ''
        else:
            return '/login', 'Incorrect email or password'
    else:
        return '/login', 'Incorrect email or password'


@callback(Output('page-content', 'children'), Output('redirect', 'pathname'),
              [Input('url', 'pathname')])
def display_page(pathname):
    ''' callback to determine layout to return '''
    # We need to determine two things for everytime the user navigates:
    # Can they access this page? If so, we just return the view
    # Otherwise, if they need to be authenticated first, we need to redirect them to the login page
    # So we have two outputs, the first is which view we'll return
    # The second one is a redirection to another page is needed
    # In most cases, we won't need to redirect. Instead of having to return two variables everytime in the if statement
    # We setup the defaults at the beginning, with redirect to dash.no_update; which simply means, just keep the requested url
    # view = None
    
    url = no_update
    if pathname == '/login':
        view = LayoutHandler.login_layout_children
    elif pathname == '/success':
        if current_user.is_authenticated:
            view = LayoutHandler.main_app_layout_children(neo4j_connector=neo4j)
            url = '/main_app'
        else:
            view = LayoutHandler.failed_layout_children
    elif pathname == '/logout':
        if current_user.is_authenticated:
            logout_user()
            view = LayoutHandler.logout_layout_children
        else:
            view = LayoutHandler.login_layout_children
            url = '/login'

    elif pathname == '/main_app':
        print(f"{current_user.is_authenticated=}")
        if current_user.is_authenticated:
            view = LayoutHandler.main_app_layout_children(neo4j_connector=neo4j)
        else:
            view = 'Redirecting to login...'
            url = '/login'
    else:
        view = LayoutHandler.login_layout_children
        url = '/login'
        
    # You could also return a 404 "URL not found" page here
    return view, url


if __name__ == "__main__":
    app.run_server('0.0.0.0', port=8051, debug=True)
