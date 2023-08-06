#! /usr/bin/python3

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger

from flask import Flask, request, jsonify

logger = Logger(log_group_name=f"api")
neo4j = Neo4jDB(logger=logger)

def create_server():
    app = Flask(__name__)
    @app.route("/get_event_type_mappings")
    def get_event_type_mappings():
        try:
            result = neo4j.execute_query(queries.GET_EVENT_TYPE_NAMES_MAPPINGS)
            # result = {"event" : "type_mappings"}
            return result
        except Exception as e:
            # Return a 500 error with a description of the problem
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    @app.route("/get_user_login_info", methods=["POST"])
    def get_user_login_info():
        try:
            data = request.get_json()  # Get data sent in POST request
            if not data:
                return jsonify({"message": "No input data provided"}), 400
            email = data.get('email')
            hashed_password = data.get('hashed_password')

            if not email or not hashed_password:
                return jsonify({"message": "Missing email or hashed_password"}), 400
            GET_USER_LOGIN_INFO = """
                MATCH (account:Account)
                WHERE account.Email = '{email}' AND account.PasswordHash = '{hashed_password}'
                OPTIONAL MATCH (account)-[:FRIENDS_WITH]->(friend:Account)
                WITH account, collect(DISTINCT {{friendUUID: friend.UUID, friendFirstName: friend.FirstName, friendLastName: friend.LastName, friendUsername: friend.Username}}) as Friends
                OPTIONAL MATCH (account)-[:INTERESTED_IN]->(eventType:EventType)
                WITH account, Friends, collect(DISTINCT eventType.UUID) as Interests
                RETURN
                    account.Email as Email,
                    account.Username as Username,
                    account.FirstName as FirstName,
                    account.LastName as LastName,
                    account.UUID as UUID,
                    Friends,
                    Interests;
                """.format(email=email, hashed_password=hashed_password)

            result = neo4j.execute_query(GET_USER_LOGIN_INFO)
            
            return result

        except Exception as e:
            # Return a 500 error with a description of the problem
            return jsonify({"message": "An error occurred: " + str(e)}), 500

    @app.route('/events')
    def events():
        return {"events" : ["event1", "event2"]}

    return app
