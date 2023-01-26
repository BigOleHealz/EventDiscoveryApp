from datetime import datetime as dt
from typing import List, Mapping

from dash import Dash, dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

from utils.figures import figmap
from constants import dict_of_locations

PLOTLY_LOGO = "https://images.plot.ly/logo/new-branding/plotly-logomark.png"

import pdb; pdb.set_trace()


app = Dash(__name__, title = "New York Uber Rides", external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME])
server = app.server

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
                                dbc.NavItem(dbc.NavLink("Page 1")),
                                dbc.NavItem(
                                    dbc.NavLink("Page 2"),
                                    # add an auto margin after page 2 to
                                    # push later links to end of nav
                                    className="me-auto",
                                ),
                                dbc.NavItem(dbc.NavLink("Help")),
                                dbc.NavItem(dbc.NavLink("About")),
                            ],
                            # make sure nav takes up the full width for auto
                            # margin to get applied
                            # className="w-100",
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

sidebar = html.Div(
    [
        html.Div(
            [
                # width: 3rem ensures the logo is the exact width of the
                # collapsed sidebar (accounting for padding)
                html.Img(src=PLOTLY_LOGO, style={"width": "3rem"}),
                html.H2("Sidebar"),
            ],
            className="sidebar-header",
        ),
        html.Hr(),
        dbc.Nav(
            [
                dcc.DatePickerSingle(
                    id="date-picker",
                    initial_visible_month=dt.today(),
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
                    value=tuple(dict_of_locations.keys())
                ),
            ],
            vertical=True,
            pills=True,
        ),
    ],
    className="sidebar"
)

map_content = html.Div(
            style={'width' : '100%', 'height' : "90vh"},
            className="row",
            children=[
                # row for app graphs and plots
                html.Div(
                    className="eight columns div-for-charts bg-grey",
                    children=[
                        dcc.Graph(id="map-graph",
                                    config={ 'displayModeBar': False}
                                ),
                    ],
                )
            ],
        )

# Layout of Dash App
app.layout = html.Div(
    children=[
        header,
        dcc.Location(id="url"),
        sidebar,
        map_content
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


if __name__ == "__main__":
    app.run_server(debug=True)
