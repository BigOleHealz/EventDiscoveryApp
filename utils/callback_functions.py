import os, traceback, sys
from datetime import datetime as dt, timedelta
from typing import Mapping, List

from py2neo import Node

from utils.components import Components
from db.db_handler import Neo4jDB
from utils.map_handler import tile_layer
from utils.constants import CURRENTLY_ATTENDING_BUTTON_TEXT, NOT_CURRENTLY_ATTENDING_BUTTON_TEXT, datetime_format

def callback_create_event(neo4j_connector: Neo4jDB,
                            session_account_node: Node,  # remove after session works
                            event_name: str,
                            event_date: str,
                            starttime: int,
                            endtime: int,
                            event_type_id: int,
                            friends_invited: list,
                            public_event_flag: bool,
                            click_lat_lng: list=None,
                            n_clicks: int=None
                        ):
    
    components = Components(neo4j_connector=neo4j_connector)
    
    required_args = [event_name, click_lat_lng, event_type_id]
    event_date_dt = dt.strptime(event_date, '%Y-%m-%d')
        
    start_ts = (event_date_dt + timedelta(hours=starttime)).strftime(datetime_format)
    end_ts = (event_date_dt + timedelta(hours=endtime)).strftime(datetime_format)
    
    if n_clicks is not None:
        if all([val is not None for val in required_args]):
            created_at = dt.now().strftime(datetime_format)
            properties = {
                            'CreatedByID'    : session_account_node.identity,
                            'EventName'      : event_name,
                            'StartTimestamp' : start_ts,
                            'EndTimestamp'   : end_ts,
                            'EventTypeID'    : event_type_id,
                            'CreatedAt'      : created_at,
                            'PublicEvent'    : public_event_flag,
                            'Lat'            : click_lat_lng[0],
                            'Lon'            : click_lat_lng[-1]
                        }
            node = neo4j_connector.create_event_with_relationships(creator_node=session_account_node, properties=properties, friends_invited=friends_invited)
            return components.sidebar_right(), components.create_alert_message_child(message="Successfully created Event!", color='success')
        
        else:
            return components.sidebar_right(event_name=event_name,
                                            event_date=event_date,
                                            starttime=starttime,
                                            endtime=endtime,
                                            event_type_id=event_type_id,
                                            friends_invited=friends_invited,
                                            public_event_flag=public_event_flag
                    ), components.create_alert_message_child(message="All fields are required", color='danger')
    else:
        return components.sidebar_right(event_name=event_name,
                                        event_date=event_date,
                                        starttime=starttime,
                                        endtime=endtime,
                                        event_type_id=event_type_id,
                                        friends_invited=friends_invited,
                                        public_event_flag=public_event_flag
                ), []

def callback_attend_event(neo4j_connector: Neo4jDB,
                            session_account_node: Node,  # remove after session works
                            n_clicks: int,
                            value: str,
                            button_data: dict
                        ):
    if n_clicks is not None:
        if value == CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.delete_attending_relationship(attendee_node_id=session_account_node.identity, event_node_id=button_data['index'])
            return NOT_CURRENTLY_ATTENDING_BUTTON_TEXT
        elif value == NOT_CURRENTLY_ATTENDING_BUTTON_TEXT:
            neo4j_connector.create_attending_relationship_by_id(attendee_node_id=session_account_node.identity, event_node_id=button_data['index'])
            return CURRENTLY_ATTENDING_BUTTON_TEXT
        else:
            raise Exception(traceback.format_exc())
    else:
        return value
