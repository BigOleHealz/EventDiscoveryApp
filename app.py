#!/usr/bin/python3

from typing import List, Mapping

from dash import Dash, dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

from utils.figures import figmap
from utils.components import header, sidebar, map_content


app = Dash(__name__, title = "Event Finder", external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.FONT_AWESOME])
server = app.server

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
