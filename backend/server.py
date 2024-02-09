import json, traceback, logging, os, sys

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
# import db.message_strings as strings


load_dotenv()


api_logger = Logger(log_group_name=f"api")
neo4j = Neo4jDB(logger=api_logger)

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
        print("secret_id: ", secret_id)
        if not secret_id:
            return jsonify({"message": "No secret_id provided"}), 400
        if secret_id not in ["GOOGLE_MAPS_API_KEY", "GOOGLE_OAUTH_CREDENTIALS"]:
            return jsonify({"message": "Invalid secret_id provided. None of your business. Get off of my website scammer."}), 400
        secret_string = os.getenv(secret_id)
        
        return jsonify({secret_id: secret_string}), 200
    except Exception as e:
        # api_logger.error(f"An error occurred: {traceback.format_exc()}")
        return {"message": f"An error occurred: {traceback.format_exc()}"}, 500

@app.route("/get_user_profile", methods=["POST"])
def get_user_profile():
    try:
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
        
@app.route('/')
@cross_origin()
def serve():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)