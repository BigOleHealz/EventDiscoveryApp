import json, traceback, logging, os

from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask.helpers import send_from_directory
from flask_cors import CORS, cross_origin

import backend.db.message_strings as strings
# import db.message_strings as strings


load_dotenv()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

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
        if secret_id not in ["GOOGLE_MAPS_API_KEY", "google_oauth_credentials"]:
            return jsonify({"message": "Invalid secret_id provided. None of your business. Get off of my website scammer."}), 400
        # client = boto3.client('secretsmanager', region_name='us-east-1')
        # response = client.get_secret_value(SecretId=secret_id)
        # secret_string = response['SecretString']
        secret_string = os.getenv(secret_id)
        
        return jsonify({secret_id: secret_string}), 200
        # secret_dict = json.loads(secret_string)

        # return jsonify(secret_dict), 200
    except Exception as e:
        # api_logger.error(f"An error occurred: {traceback.format_exc()}")
        return {"message": f"An error occurred: {traceback.format_exc()}"}, 500

@app.route('/')
@cross_origin()
def serve():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)