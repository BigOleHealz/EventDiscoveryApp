
from dash import dcc, html
import dash_bootstrap_components as dbc

from ui.components import Components
from db.db_handler import Neo4jDB

class LayoutHandler:
    
    
    @staticmethod
    def home_page_layout(neo4j_connector: Neo4jDB):
        components = Components(neo4j_connector=neo4j_connector)
        return [
                components.header,
                html.Div([
                    components.sidebar_left,
                    html.Div(components.sidebar_right(),
                            id="right_sidebar",
                            className="sidebar-right"
                        ),
                    components.map_content(neo4j_connector=neo4j_connector)
                ]),
                html.Div(id='coordinate-click-id')
            ]
    
    login_layout_children = [
                                dcc.Location(id='url_login', refresh=True),
                                html.Div(
                                    children=[
                                        html.H2(children='Please log in to continue:',
                                                style={'text-align': 'center'}),
                                        dcc.Input(placeholder='Enter your email',
                                                type='text',
                                                id='login-email-box',
                                                className='default-input-style'),
                                        html.Br(),
                                        dcc.Input(placeholder='Enter your password',
                                                    type='password',
                                                    id='login-pwd-box',
                                                    className='default-input-style'),
                                        html.Br(),
                                        html.Button(children='Login',
                                                    n_clicks=0,
                                                    type='submit',
                                                    id='login-button',
                                                    className='default-input-style'),
                                        html.Br(),
                                        html.Label("Dont have an account?", className='no-account-label'),
                                        html.A('Create One Here', href='/create_account', className='hyperlink'),
                                        
                                        html.Div(children='', id='output-state')
                                    ],
                                    className='login-parent-div'
                                )
                            ]
        
    
    @staticmethod
    def create_account_children(neo4j_connector: Neo4jDB):
        event_type_mappings = neo4j_connector.get_event_type_mappings()
        
        return [
                    html.Div(
                        children=[
                            # html.Div(children=[
                            html.H2(children='Create Account',
                                    style={'text-align': 'center'}),
                            dcc.Input(placeholder='Enter your First Name',
                                        type='text',
                                        id='create-account-first-name-box',
                                        className='default-input-style'),
                            html.Br(),
                            dcc.Input(placeholder='Enter your Last Name',
                                        type='text',
                                        id='create-account-last-name-box',
                                        className='default-input-style'),
                            html.Br(),
                            dcc.Input(placeholder='Enter your email',
                                    type='text',
                                    id='create-account-email-box',
                                    className='default-input-style'),
                            html.Br(),
                            dcc.Input(placeholder='Enter your password',
                                        type='password',
                                        id='create-account-pwd-box',
                                        className='default-input-style'),
                            
                            dcc.Input(placeholder='Confirm your password',
                                        type='password',
                                        id='create-account-confirm-pwd-box',
                                        className='default-input-style'),
                            html.Br(),
                            html.Button(children='Create Account',
                                        n_clicks=0,
                                        type='submit',
                                        id='create-account-button',
                                        className='default-input-style'),
                            html.A('Back to Login', href='/login', className='hyperlink'),
                            
                            # html.Button("Open Modal", id="open-modal"),
                            dbc.Modal([dbc.ModalHeader("Modal Header",
                                                        style={'color': '#212529'}
                                                        ),
                                        dbc.ModalBody(
                                            html.Div(children=[
                                                dcc.Checklist(
                                                    id='user_interests-checklist',
                                                    options=[{'label': rec['EventName'], 'value': rec['_id']} for rec in event_type_mappings],
                                                    labelStyle={'display' : 'block'},
                                                    style={'color': '#212529'}
                                                ),
                                            ]),
                                        ),
                                        dbc.ModalFooter([
                                            dbc.Button("Back", id="close-modal-button", className="ml-auto"),
                                            dbc.Button("Submit", id="submit-interests-button", className="ml-auto")
                                        ],
                                        ),
                                    ],
                                    id="modal",
                                    centered=True
                                ),
                            
                            
                            html.Div(children='', id='output-state', style={'text-align': 'center'})
                        ],
                        className='login-parent-div'
                    )
                ]
        
        
        

    # Failed Login
    failed_layout_children = [
                                html.H2('Log in Failed. Please try again.'),
                                html.Div(login_layout_children),
                            ]

    # logout
    logout_layout_children = [
                                html.Div(html.H2('You have been logged out - Please login')),
                                html.Br(),
                                html.Div(login_layout_children)
                            ]
