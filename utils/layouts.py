
from dash import dcc, html

from utils.components import Components
from db.db_handler import Neo4jDB

class LayoutHandler:
    
    @staticmethod
    def main_app_layout_children(neo4j_connector: Neo4jDB):
        return [
                components.sidebar_left,
                html.Div(components.sidebar_right(),
                        id="right_sidebar",
                        className="sidebar-right"
                    ),
                components.map_content(neo4j_connector=neo4j_connector),
                html.Div(id='coordinate-click-id')
            ]
    
    login_layout_children = [
                                dcc.Location(id='url_login',
                                            refresh=True),
                                html.H2('''Please log in to continue:''',
                                        id='h1'),
                                dcc.Input(placeholder='Enter your username',
                                            type='text',
                                            id='uname-box'),
                                dcc.Input(placeholder='Enter your password',
                                            type='password',
                                            id='pwd-box'),
                                html.Button(children='Login',
                                            n_clicks=0,
                                            type='submit',
                                            id='login-button'),
                                html.Div(children='',
                                        id='output-state'),
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
