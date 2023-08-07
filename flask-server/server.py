#! /usr/bin/python3

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger

from flask import Flask, request, jsonify

logger = Logger(log_group_name=f"api")
neo4j = Neo4jDB(logger=logger)

def create_server():
    app = Flask(__name__)
    @app.route("/get_event_type_mappings", methods=["GET"])
    def get_event_type_mappings():
        try:
            result = neo4j.execute_query(queries.GET_EVENT_TYPE_NAMES_MAPPINGS)
            return result
        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    @app.route("/get_user_login_info", methods=["POST"])
    def get_user_login_info():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            email = body.get('email')
            hashed_password = body.get('hashed_password')

            if not email or not hashed_password:
                return jsonify({"message": "Missing email or hashed_password"}), 400
            formatted_query = queries.GET_USER_LOGIN_INFO.format(email=email, hashed_password=hashed_password)

            result = neo4j.execute_query(formatted_query)
            
            return result[0]

        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    @app.route('/events', methods=["POST"])
    def events():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            start_timestamp = body.get('start_timestamp')
            end_timestamp = body.get('end_timestamp')

            if not start_timestamp or not end_timestamp:
                return jsonify({"message": "Missing start_timestamp or end_timestamp"}), 400
            formatted_query = queries.FETCH_EVENTS_FOR_MAP.format(start_timestamp=start_timestamp, end_timestamp=end_timestamp)

            result = neo4j.execute_query(formatted_query)
            
            return result

        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    return app
