
import json, traceback, logging, os, sys
from datetime import datetime
from uuid import uuid4
import requests

from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin

current = os.path.dirname(os.path.realpath(__file__))
parent = os.path.dirname(current)
sys.path.append(parent)

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger
import db.message_strings as strings


load_dotenv()

api_logger = Logger(name=f"api")
app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "https://still-retreat-74647-ffbb5da2e206.herokuapp.com/"}})



@app.route('/api/get_secret', methods=['POST'])
@cross_origin()
def get_secret():
    try:
        body = request.get_json()
        print("body: ", body)
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        secret_id = body.get('secret_id')
        if not secret_id:
            return jsonify({"message": "No secret_id provided"}), 400
        if secret_id not in ["GOOGLE_MAPS_API_KEY", "client_id"]:
            return jsonify({"message": "Invalid secret_id provided. None of your business. Get off of my website scammer."}), 400
        secret_string = os.getenv(secret_id)
        
        return jsonify({secret_id: secret_string}), 200
    except Exception as e:
        # neo4j_handler.api_logger.error(f"An error occurred: {traceback.format_exc()}")
        return {"message": f"An error occurred: {traceback.format_exc()}"}, 500

@app.route("/api/get_google_profile", methods=["POST"])
@cross_origin()
def get_google_profile():
    try:
        body = request.get_json()
        print(body)
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
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
        response.raise_for_status()
        profile = response.json()
        return profile, 200

    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route("/api/get_user_profile", methods=["POST"])
@cross_origin()
def get_user_profile():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        email = body.get(strings.email)

        if not email:
            return jsonify({"message": strings.missing_email}), 400
        result = neo4j.execute_query_with_params(query=queries.GET_USER_PROFILE, params=body)
        
        if len(result) == 0:
            return jsonify([]), 200
        elif len(result) > 1:
            return jsonify({"message": "More than one user found with email: " + email}), 200
        else:
            return jsonify(result[0]), 200

    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500


@app.route("/api/get_event_type_mappings", methods=["GET"])
@cross_origin()
def get_event_type_mappings():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        api_logger.info("Fetching event type mappings")
        result = neo4j.execute_query(queries.GET_EVENT_TYPE_NAMES_MAPPINGS)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route('/api/fetch_events', methods=["POST"])
@cross_origin()
def fetch_events():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        start_timestamp = body.get(strings.start_timestamp)
        end_timestamp = body.get(strings.end_timestamp)
        
        if not start_timestamp:
            return jsonify({"message": strings.missing_start_timestamp}), 400
        elif not end_timestamp:
            return jsonify({"message": strings.missing_end_timestamp}), 400
        
        result = neo4j.execute_query_with_params(query=queries.FETCH_EVENTS_FOR_MAP, params=body)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route('/api/create_person_node', methods=["POST"])
@cross_origin()
def create_person_node():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        username = body.get(strings.username)
        email = body.get(strings.email)
        first_name = body.get(strings.first_name)
        last_name = body.get(strings.last_name)
        interest_uuids = body.get(strings.interest_uuids)

        if not username:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.missing_username}), 400
        elif not email:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.missing_email}), 400
        elif not first_name:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.missing_first_name}), 400
        elif not last_name:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.missing_last_name}), 400
        elif not interest_uuids:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "You must select at least one event type"}), 400
        
        result = neo4j.execute_query_with_params(query=queries.CREATE_PERSON_NODE, params=body)
        
        if len(result) == 0:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "User could not be created"}), 400
        else:
            result = result[0]
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

@app.route('/api/create_event_node', methods=["POST"])
@cross_origin()
def create_event_node():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        event_type_uuid = body.get('EventTypeUUID')
        event_lat = body.get('Lat')
        event_lon = body.get('Lon')
        event_start_timestamp = body.get('StartTimestamp')
        event_end_timestamp = body.get('EndTimestamp')
        created_by_uuid = body.get('CreatedByUUID')
        friends_invited = body.get('FriendsInvited')

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
        elif not friends_invited:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing friends_invited"}), 400

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


@app.route('/api/fetch_friends', methods=["POST"])
@cross_origin()
def fetch_friends():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        
        uuid = body.get('UUID')
        if not uuid:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.missing_uuid}), 400
        
        try:
            result = neo4j.execute_query_with_params(query=queries.FETCH_FRIENDS_BY_UUID, params=body)
            return result
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

@app.route('/api/fetch_pending_friend_requests', methods=["POST"])
@cross_origin()
def fetch_pending_friend_requests():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        username = body.get('Username')

        if not username:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing username"}), 400

        result = neo4j.execute_query_with_params(query=queries.GET_PENDING_FRIEND_REQUESTS_BY_RECIPIENT_UUID, params=body)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500


@app.route('/api/respond_to_friend_request', methods=["POST"])
@cross_origin()
def respond_to_friend_request():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
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



@app.route('/api/attend_event_and_send_invites', methods=["POST"])
@cross_origin()
def attend_event_and_send_invites():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
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

@app.route('/api/create_friend_request_relationship_if_not_exists', methods=["POST"])
@cross_origin()
def create_friend_request_relationship_if_not_exists():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
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

@app.route('/api/fetch_event_invites', methods=["POST"])
@cross_origin()
def fetch_event_invites():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
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
        
@app.route('/api/respond_to_event_invite', methods=["POST"])
@cross_origin()
def respond_to_event_invite():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
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
    
@app.route('/api/fetch_events_attended_by_user', methods=["POST"])
@cross_origin()
def fetch_events_attended_by_user():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        
        attendee_uuid = body.get('AttendeeUUID')
        if not attendee_uuid:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing AttendeeUUID"}), 400
        
        try:
            result = neo4j.execute_query_with_params(query=queries.FETCH_EVENTS_ATTENDED_BY_USER, params=body)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

@app.route('/api/fetch_events_created_by_user', methods=["POST"])
@cross_origin()
def fetch_events_created_by_user():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        
        created_by_uuid = body.get('CreatedByUUID')
        if not created_by_uuid:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing CreatedByUUID"}), 400
        
        try:
            result = neo4j.execute_query_with_params(query=queries.FETCH_EVENTS_CREATED_BY_USER, params=body)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

@app.route("/api/is_username_taken", methods=["POST"])
@cross_origin()
def is_username_taken():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        username = body.get(strings.username)

        if not username:
            return jsonify({"message": strings.missing_username}), 400
        result = neo4j.execute_query_with_params(query=queries.IS_USERNAME_TAKEN, params=body)
        if len(result) == 0:
            return jsonify({"message": strings.length_of_response_0}), 400
        elif len(result) > 1:
            return jsonify({"message": strings.length_of_response_greater_than_1}), 400
        else:
            return jsonify(result[0]), 200

    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route('/api/fetch_upcoming_events_for_user', methods=["POST"])
@cross_origin()
def fetch_upcoming_events_for_user():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"STATUS": "ERROR", "MESSAGE": strings.no_input_body_provided}), 400
        
        attendee_uuid = body.get('AttendeeUUID')
        if not attendee_uuid:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "Missing AttendeeUUID"}), 400
        
        try:
            result = neo4j.execute_query_with_params(query=queries.FETCH_UPCOMING_EVENTS_FOR_USER, params=body)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

    except Exception as e:
        return jsonify({"STATUS": "ERROR", "MESSAGE": "An error occurred: " + str(e)}), 500

@app.route('/api/delete_node', methods=["POST"])
@cross_origin()
def delete_node():
    try:
        neo4j = Neo4jDB(logger=api_logger)
        body = request.get_json()
        if not body:
            return jsonify({"message": strings.no_input_body_provided}), 400
        uuid = body.get('UUID')

        if not uuid:
            return jsonify({"message": strings.missing_uuid}), 400
        result = neo4j.execute_query_with_params(query=queries.DELETE_NODE_BY_UUID, params=body)
        if len(result) == 0:
            return jsonify({"message": strings.delete_node_not_found}), 400
        else:
            result = result[0]
            return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route('/')
@cross_origin()
def serve():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)