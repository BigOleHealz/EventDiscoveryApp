
from dash import Dash, dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

from utils.figures import histogram, map as figmap
from constants import totalList
from utils.helper_functions import total_rides_calculation
from utils.components import controls
from datetime import datetime as dt

app = Dash(__name__, title = "New York Uber Rides", external_stylesheets=[dbc.themes.BOOTSTRAP])
server = app.server


# Layout of Dash App
app.layout = html.Div(
    children=[
        # html.Div(className="eight columns div-for-charts bg-grey", style={'width' : '100%', 'height' : "10%"}),
        html.Div(
            className="row",
            children=[
                # row for app graphs and plots
                html.Div(
                    className="eight columns div-for-charts bg-grey",
                    children=[
                        dcc.Graph(id="map-graph",
                                    config={ 'displayModeBar': False},
                                    style={'width' : '100%', 'height' : "100%"}
                                ),
                        dcc.Graph(id="histogram", config={ 'displayModeBar': False }),
                    ],
                ),
                # Column for user controls
                controls(app),
            ],
        )
    ]
)


@callback(
    Output("bar-selector", "value"),
    Input("histogram", "selectedData"), 
    Input("histogram", "clickData"),
)
def update_bar_selector(value, clickData):
    " Selected Data in the Histogram updates the Values in the Hours selection dropdown menu "
    holder = []
    if clickData:
        holder.append(str(int(clickData["points"][0]["x"])))
    if value:
        for x in value["points"]:
            holder.append(str(int(x["x"])))
    return list(set(holder))


@callback(
    Output("histogram", "selectedData"), 
    Input("histogram", "clickData"),
)
def update_selected_data(clickData):
    " Clear Selected Data if Click Data is used "
    if clickData:
        return {"points": []}



@callback(
    Output("histogram", "figure"),
    Input("date-picker", "date"), 
    Input("bar-selector", "value"),
)
def update_histogram(date_picked, bars_selected):
    " Update Histogram Figure based on Month, Day and Times Chosen "
    return histogram(date_picked, bars_selected)


@callback(
    Output("map-graph", "figure"),
    Input("date-picker", "date"),
    Input("bar-selector", "value"),
    Input("location-dropdown", "value"),
)
def update_graph(date_picked, bars_selected, location): # date_picked, bars_selected, 
    " Update Map Graph based on date-picker, selected data on histogram and location dropdown "
    return figmap(date_picked, bars_selected, location) # date_picked, bars_selected, 


if __name__ == "__main__":
    app.run_server(debug=True)
