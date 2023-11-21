#! /usr/bin/python3
import json, traceback, logging
from datetime import datetime
from uuid import uuid4

import requests
import boto3

from flask import Flask, request, jsonify
from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger


api_logger = Logger(log_group_name=f"api")
neo4j = Neo4jDB(logger=api_logger)

session_loggers_cache = {}

def create_server():
    app = Flask(__name__)

    @app.route('/get_aws_secret', methods=['POST'])
    def get_aws_secret():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            secret_id = body.get('secret_id')
            if not secret_id:
                return jsonify({"message": "No secret_id provided"}), 400
            if secret_id not in ["google_maps_api_key", "google_oauth_credentials"]:
                return jsonify({"message": "Invalid secret_id provided. None of your business. Get off of my website scammer."}), 400
            client = boto3.client('secretsmanager', region_name='us-east-1')
            response = client.get_secret_value(SecretId=secret_id)
            secret_string = response['SecretString']
            secret_dict = json.loads(secret_string)

            return jsonify(secret_dict), 200
        except Exception as e:
            api_logger.error(f"An error occurred: {traceback.format_exc()}")
            return {"message": f"An error occurred: {traceback.format_exc()}"}, 500

    @app.route('/logs', methods=['POST'])
    def send_logs_to_cloudwatch():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            log_message = body.get('log_message')
            log_level = body.get('log_level')
            log_group = body.get('log_group')
            log_stream = body.get('log_stream', datetime.now().strftime('%Y-%m-%dT%H-%M-%S'))

            if not log_message:
                return {"message": "No log_message provided"}, 400
            if not log_level:
                return {"message": "No log_level provided"}, 400
            if not log_group:
                return {"message": "No log_group provided"}, 400

            logger_key = f"{log_group}-{log_stream}"
            if logger_key not in session_loggers_cache:
                session_loggers_cache[logger_key] = Logger(log_group_name=log_group, log_stream_name=log_stream)
            session_logger = session_loggers_cache[logger_key]

            log_level_function = session_logger.log_level_function_mappings.get(log_level)
            if not log_level_function:
                return {"message": f"Invalid log_level provided: {log_level}. Valid log_level values are {[key for key in session_logger.log_level_function_mappings.keys()]}"}, 400

            log_level_function(log_message)
            return {"message": "success"}, 200

        except:
            api_logger.error(f"An error occurred: {traceback.format_exc()}")
            return {"message": f"An error occurred: {traceback.format_exc()}"}, 500
            
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
    
    @app.route("/get_google_profile", methods=["POST"])
    def get_google_profile():
        try:
            body = request.get_json()
            print(body)
            if not body:
                return jsonify({"message": "No input body provided"}), 400
            access_token = body.get('access_token')

            if not access_token:
                return jsonify({"message": "Missing access_token"}), 400
            
            url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "Content-Type": "application/json"
            }

            response = requests.get(url, headers=headers)
            response.raise_for_status()  # This will raise an HTTPError if the HTTP request returned an unsuccessful status code
            profile = response.json()
            return profile, 200

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
            result = neo4j.execute_query(formatted_query)
            
            if 'UUID' in result[0]:
                return jsonify({"success": True, "UUID": result[0]['UUID']})
            else:
                return jsonify({"success": False, "message": "Person node could not be created"}), 400
        except Exception as e:
            return jsonify({"message": "An error occurred: " + str(e)}), 500
    
    @app.route('/create_friend_request_relationship_if_not_exists', methods=["POST"])
    def create_friend_request_relationship_if_not_exists():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            username_sender = body.get('username_sender')
            username_recipient = body.get('username_recipient')

            if not username_sender:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing username_sender"}), 400
            elif not username_recipient:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing username_recipient"}), 400

            result = neo4j.execute_query_with_params(query=queries.CREATE_FRIEND_REQUEST_RELATIONSHIP_IF_NOT_EXISTS, params=body)
            if len(result) == 0:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Friend request relationship could not be created"}), 400
            else:
                result = result[0]
                return jsonify(result), 200
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
    
    @app.route('/respond_to_friend_request', methods=["POST"])
    def respond_to_friend_request():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            friend_request_uuid = body.get('friend_request_uuid')
            response = body.get('response')

            if not friend_request_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing friend_request_uuid"}), 400
            elif not response:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing response"}), 400
            
            result = neo4j.execute_query_with_params(query=queries.RESPOND_TO_FRIEND_REQUEST_BY_FRIEND_REQUEST_UUID, params=body)
            if len(result) == 0:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Friendship could not be created"}), 400
            else:
                result = result[0]
                return jsonify(result), 200

        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
    
    @app.route('/fetch_pending_friend_requests', methods=["POST"])
    def fetch_pending_friend_requests():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            username = body.get('Username')

            if not username:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing username"}), 400

            result = neo4j.execute_query_with_params(query=queries.GET_PENDING_FRIEND_REQUESTS_BY_RECIPIENT_UUID, params=body)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

    @app.route('/create_event_node', methods=["POST"])
    def create_event_node():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            event_type_uuid = body.get('EventTypeUUID')
            event_lat = body.get('Lat')
            event_lon = body.get('Lon')
            event_start_timestamp = body.get('StartTimestamp')
            event_end_timestamp = body.get('EndTimestamp')
            created_by_uuid = body.get('CreatedByUUID')

            if not event_type_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_type_uuid"}), 400
            elif not event_lat:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_lat"}), 400
            elif not event_lon:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_lon"}), 400
            elif not event_start_timestamp:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_start_timestamp"}), 400
            elif not event_end_timestamp:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_end_timestamp"}), 400
            elif not created_by_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing created_by_uuid"}), 400

            event_data = body
            uuid = str(uuid4())
            event_data['UUID'] = uuid
            event_data['Source'] = 'user_created'
            event_data['SourceEventID'] = uuid
            event_data['Summary'] = body.get('EventDescription', '')

            try:
                result = neo4j.execute_query_with_params(query=queries.CREATE_USER_CREATED_EVENT, params=event_data)
                return jsonify({"STATUS": "SUCCESS", "MESSAGE": "Event node created successfully"}), 200
            except Exception as e:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
    

    @app.route('/attend_event_and_send_invites', methods=["POST"])
    def attend_event_and_send_invites():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            event_uuid = body.get('EventUUID')
            attendee_uuid = body.get('AttendeeUUID')
            invite_uuids = body.get('InviteeUUIDs')

            if not event_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_uuid"}), 400
            elif not attendee_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing attendee_uuid"}), 400
            elif not invite_uuids:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing invite_uuids"}), 400

            try:
                result = neo4j.execute_query_with_params(query=queries.ATTEND_EVENT_AND_SEND_INVITES, params=body)
                return jsonify({"STATUS": "SUCCESS", "MESSAGE": "Event attendance and invites sent successfully"}), 200
            except Exception as e:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
    
    @app.route('/fetch_event_invites', methods=["POST"])
    def fetch_event_invites():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            invitee_uuid = body.get('InviteeUUID')

            if not invitee_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing InviteUUID"}), 400

            try:
                result = neo4j.execute_query_with_params(query=queries.FETCH_EVENT_INVITES, params=body)
                return jsonify(result), 200
            except Exception as e:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
        
    @app.route('/respond_to_event_invite', methods=["POST"])
    def respond_to_event_invite():
        try:
            body = request.get_json()
            if not body:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "No input body provided"}), 400
            event_invite_uuid = body.get('event_invite_uuid')
            response = body.get('response')

            if not event_invite_uuid:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing event_invite_uuid"}), 400
            elif not response:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing response"}), 400
            
            result = neo4j.execute_query_with_params(query=queries.RESPOND_TO_EVENT_INVITE_BY_EVENT_INVITE_UUID, params=body)
            if len(result) == 0:
                return jsonify({"STATUS": "ERROR", "MESSAGE": "Response could not be sent"}), 400
            else:
                result = result[0]
                return jsonify(result), 200

        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500
    return app
