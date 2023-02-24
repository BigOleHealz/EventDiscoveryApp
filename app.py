#!/home/bigolehealz/workspace/EventApp/myenv/bin/python3.8

import os, traceback, sys, secrets
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from flask import Flask
from flask_login import login_user, LoginManager, logout_user, current_user
from dash import Dash, dcc, html, Input, Output, State, callback, callback_context, MATCH, no_update
import dash_bootstrap_components as dbc

from ui.layouts import LayoutHandler
from utils.entities import Account
from ui.components import Components
from utils.logger import Logger
from db.db_handler import Neo4jDB
from ui.map_handler import tile_layer
from utils.callback_functions import create_event, callback_attend_event, toggle_modal, toggle_add_friends_container, toggle_event_invites_container
from utils.constants import RouteManager as routes, accept_event_invite_button_id, decline_event_invite_button_id


logger = Logger(name=__file__)

server = Flask(__name__)
app = Dash(__name__,
            server=server,
            title="Event Finder",
            external_stylesheets=['assets/css/style.css', dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME],
            suppress_callback_exceptions=True,
            prevent_initial_callbacks=True
        )
logger.info("Dash app initialized")

server.config.update(SECRET_KEY=secrets.token_hex(24))

login_manager = LoginManager()
login_manager.init_app(server)
login_manager.login_view = routes.login

neo4j = Neo4jDB(logger=logger)

app.layout = html.Div(
    children=[
        dcc.Location(id='url', refresh=False),
        dcc.Location(id='redirect', refresh=True),
        dcc.Store(id='login-status', storage_type='session'),
        html.Div(id='user-status-div'),
        
        
        dcc.Store(id='alert-msg-store', storage_type='session'),
        html.Div(id='alert_msg'),
                
        dcc.Store(id='home_page_layout_alert-store', storage_type='session', data=None),
        dcc.Store(id='login_layout_alert-store', storage_type='session', data=None),
        dcc.Store(id='create_account_layout_alert-store', storage_type='session', data=None),
        
        html.Div(children=[html.Div(id='page-content')], className='primary-div'),
    ],
)

@ login_manager.user_loader
def load_user(node_id: str):
    return Account(neo4j.get_account_node(node_id=node_id))


@callback(
    Output('alert_msg', 'children'),
    [
        Input('home_page_layout_alert-store', 'data'),
        Input('login_layout_alert-store', 'data'),
        Input('create_account_layout_alert-store', 'data'),
     ])
def set_alert(home_page_layout_alert, login_layout_alert, create_account_layout_alert):
    triggered_input_data = callback_context.triggered[0]
    prop_id = ['prop_id']
    value = ['value']
    return ''


@callback(
    [
        Output("right_sidebar", "children"),
        Output("home_page_layout_alert-store", "data"),
        Output("map-id", "children")
    ],
    [
        # Filter events args (left sidebar)
        Input("date-picker", "date"),
        Input("time-slider", "value"),
        Input("location-dropdown", "value"),

        # Create event args (right sidebar)
        State("event_name-input", "value"),
        State("event_date-picker", "date"),
        State("starttime-dropdown", "value"),
        State("endtime-dropdown", "value"),
        State("event_type-dropdown", "value"),
        State("friends_invited-checklist", "value"),
        State("public_event-switch", "on"),
        State("map-id", "click_lat_lng"),
        Input("submit-button", "n_clicks")
    ])
def update_map(*args, **kwargs):
    logger.debug(f'Running {sys._getframe().f_code.co_name}')
    (date_picked, time_range, selected_location, event_name, event_date, starttime, endtime, event_type_id, friends_invited, public_event_flag, click_lat_lng, n_clicks) = args
    
    # callback_create_event must come before tile_layer refresh so that database is updated before 
    return *create_event(
                        neo4j_connector=neo4j,
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
                                current_user,
                                *args,
                                **kwargs
                            )

@callback(
        Output('friend-request-alert-box', 'children'),
        Output('friend-request-alert-box', 'color'),
        Output('friend-request-alert-box', 'is_open'),
        Input('submit-friend-request-button', 'n_clicks'),
        State('friend-request-input', 'value'))
def send_friend_request(n_clicks: int, person_email_username: str):
    if not n_clicks:
        return '', 'green', False

    person_node = neo4j.get_account_by_username_or_password(email_or_username=person_email_username)
    if person_node is None:
        return 'No user with that email or username exists', 'danger', True

    friendship_status = neo4j.get_friend_request_sent_or_if_already_friends(node_a_id=current_user.identity, node_b_id=person_node.identity)

    if friendship_status['friends_with'] is True:
        return 'You are already friends with this person', 'danger', True

    if friendship_status['friend_request_status'] == 'PENDING':
        return 'You already have a pending friend request to this person', 'danger', True

    neo4j.create_friend_request(node_a=current_user.node, node_b=person_node)
    return 'Friend Request Sent', 'success', True


@callback(
        Output({'type': 'invite_buttons', 'index': MATCH}, 'n_clicks'),
        
        Input({'type': 'invite_buttons', 'index': MATCH}, 'n_clicks'),
        State({'type': 'invite_buttons', 'index': MATCH}, 'id'),
    )
def respond_to_event_invite(n_clicks: int, button_id: str):
    print(f'Running {sys._getframe().f_code.co_name}')
    logger.debug(f'Running {sys._getframe().f_code.co_name}')
    try:
        if n_clicks:
            (button_clicked_id, relationship_uuid) = button_id['index'].split('_')
            
            if button_clicked_id == accept_event_invite_button_id:
                # Return the output object as the output of the function
                neo4j.accept_event_invite(event_invite_uuid=relationship_uuid)
            elif button_clicked_id == decline_event_invite_button_id:
                neo4j.decline_event_invite(event_invite_uuid=relationship_uuid)
            else:
                raise ValueError(f'button_id: {button_id} does not match format')
            
        return None
    except Exception as error:
        print(traceback.format_exc())
        
        
@callback(
    [Output('url_login', 'pathname'),
    Output('login_layout_alert-store', 'data')],
    [Input('login-button', 'n_clicks')],
    [State('login-email-box', 'value'),
    State('login-pwd-box', 'value')]
    )
def login_button_click(n_clicks: int, email: str, password: str):
    if n_clicks > 0:
        (account_node, auth_status) = neo4j.authenticate_account(email=email, password=password)
        
        if auth_status == 'Success':
            account = Account(account_node)
            login_user(account)
            return routes.home_page, ''
        else:
            return routes.login, 'Incorrect email or password'
    else:
        return routes.login, ''


@callback(
    [
        Output('url', 'pathname'),
        Output('create_account_layout_alert-store', 'data'),
    ],
    [
        State('create-account-first-name-box', 'value'),
        State('create-account-last-name-box', 'value'),
        State('create-account-email-box', 'value'),
        State('create-account-pwd-box', 'value'),
        State('create-account-confirm-pwd-box', 'value'),
        State('user_interests-checklist', 'value'),
        State('url', 'pathname')
    ],
    [Input('submit-interests-button', 'n_clicks')])
def create_account(first_name: str, last_name: str, email: str, password: str, password_confirm: str, user_interests: list, url: str, n_clicks: int):
    if url == routes.create_account:
        if n_clicks:
            if password != password_confirm:
                return routes.create_account, 'Password fields do not match'
            if user_interests is None:
                return routes.create_account, 'You did not select any interests. Surely you must be interested in something.'
            
            if all([var for var in [first_name, last_name, email, password, password_confirm]]):
                properties = {'FirstName' : first_name, 'LastName' : last_name, 'Email' : email}
                person_node = neo4j.create_person_node(properties=properties, password=password)
                neo4j.create_interested_in_relationship(account_id=person_node.identity, event_type_ids=user_interests)
                return routes.login, "Account Created Successfully"
            else:
                return routes.create_account, 'All fields are required'
        else:
            return url, ''
    return routes.login, ''


@callback(Output('page-content', 'children'),
            Input('url', 'pathname'))
def display_page(pathname: str):
    ''' callback to determine layout to return '''
    if pathname == routes.login:
        
        # ###################################### TEST ######################################
        # (account_node, auth_status) = neo4j.authenticate_account(email='nathan@gmail.com', password='nathan')
        
        # if auth_status == 'Success':
        #     account = Account(account_node)
        #     login_user(account)
        # view = LayoutHandler.home_page_layout(neo4j_connector=neo4j)
        # ###################################### TEST ######################################
        
        
        view = LayoutHandler.login_layout_children
    elif pathname == routes.success:
        if current_user.is_authenticated:
            view = LayoutHandler.home_page_layout(neo4j_connector=neo4j)
        else:
            view = LayoutHandler.failed_layout_children
    elif pathname == routes.logout:
        if current_user.is_authenticated:
            logout_user()
        view = LayoutHandler.logout_layout_children
    elif pathname == routes.home_page:
        if current_user.is_authenticated:
            view = LayoutHandler.home_page_layout(neo4j_connector=neo4j)
        else:
            view = LayoutHandler.login_layout_children
    elif pathname == routes.create_account:
        view = LayoutHandler.create_account_children(neo4j_connector=neo4j)
    else:
        view = LayoutHandler.login_layout_children
    return view




if __name__ == "__main__":
    app.run_server(port=8050, debug=True)
