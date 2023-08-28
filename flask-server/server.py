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

            print(result)
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
    # @app.route('/tokensignin', methods=['POST'])
    # def tokensignin():
    #     import jwt
    #     # Get the ID token from the request
    #     print(request.form)
    #     id_token = request.form.get('idToken')

    #     # Here, you can implement the token verification logic using the `PyJWT` library.
    #     GOOGLE_SIGNING_KEY = '789121404004-6144ra31e6s5ls9eknrdkejljk12oak7.apps.googleusercontent.com'  # Replace this with the actual Google signing key.
    #     try:
    #         decoded = jwt.decode(id_token, GOOGLE_SIGNING_KEY, algorithms=['RS256'])
    #         # If verification is successful, the `decoded` variable will contain the token payload.
    #         # You can access the user information from the `decoded` variable and return it as a response.

    #         # For demonstration purposes, let's assume the token contains a 'sub' claim representing the user's ID.
    #         user_id = decoded.get('sub')
    #         response_data = {'user_id': user_id}

    #         return response_data, 200

    #     except jwt.exceptions.ExpiredSignatureError:
    #         return {'error': 'Token has expired.'}, 401
    #     except jwt.exceptions.InvalidTokenError:
    #         return {'error': 'Invalid token.'}, 400

