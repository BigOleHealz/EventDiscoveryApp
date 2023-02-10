
from dash import dcc, html

from ui.components import Components
from db.db_handler import Neo4jDB

class LayoutHandler:
    
    
    @staticmethod
    def main_app_layout(neo4j_connector: Neo4jDB):
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
                                        html.A('Create One Here', href='/create_account', className='create-account-hyperlink'),
                                        
                                        html.Div(children='', id='output-state')
                                    ],
                                    className='login-parent-div'
                                )
                            ]
        
    
    create_account_children = [
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
