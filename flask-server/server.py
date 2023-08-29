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

    @app.route("/get_user_profile", methods=["POST"])
    def get_user_profile():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            email = body.get('email')

            if not email:
                return jsonify({"message": "Missing email"}), 400
            formatted_query = queries.GET_USER_PROFILE.format(email=email)

            result = neo4j.execute_query(formatted_query)
            
            if len(result) == 0:
                return jsonify([]), 200

            return jsonify(result[0])

        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    @app.route("/is_username_taken", methods=["POST"])
    def is_username_taken():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            username = body.get('username')

            if not username:
                return jsonify({"message": "Missing username"}), 400
            formatted_query = queries.IS_USERNAME_TAKEN.format(username=username)

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
    
    @app.route('/create_person_node', methods=["POST"])
    def create_person_node():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            username = body.get('Username')
            email = body.get('Email')
            first_name = body.get('FirstName')
            last_name = body.get('LastName')
            uuid = body.get('UUID')
            interest_uuids = body.get('InterestUUIDs')

            if not username:
                return jsonify({"message": "Missing username"}), 400
            elif not email:
                return jsonify({"message": "Missing email"}), 400
            elif not first_name:
                return jsonify({"message": "Missing first_name"}), 400
            elif not last_name:
                return jsonify({"message": "Missing last_name"}), 400
            elif not uuid:
                return jsonify({"message": "Missing uuid"}), 400
            elif not interest_uuids:
                return jsonify({"message": "You must select at least one event type"}), 400
            formatted_query = queries.CREATE_PERSON_NODE.format(username=username,
                                                                email=email,
                                                                first_name=first_name,
                                                                last_name=last_name,
                                                                uuid=uuid,
                                                                interest_uuids=interest_uuids
                                                            )
            logger.info(f"formatted_query: {formatted_query}")
            result = neo4j.execute_query(formatted_query)
            
            # Check if result has the UUID key, indicating a successful creation
            if 'UUID' in result[0]:
                return jsonify({"success": True, "UUID": result[0]['UUID']})
            else:
                return jsonify({"success": False, "message": "Person node could not be created"}), 400
        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    return app
