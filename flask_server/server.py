#! /usr/bin/python3

from flask import Flask, request, jsonify
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

#! /usr/bin/python3.8
import abc, os, json, traceback, sys

from db.db_handler import Neo4jDB
from db import queries
from utils.logger import Logger


logger = Logger(log_group_name=f"api")
neo4j = Neo4jDB(logger=logger)

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
        
        return jsonify(result)

    except Exception as e:
        # Return a 500 error with a description of the problem
        return jsonify({"message": "An error occurred: " + str(e)}), 500

@app.route("/get_event_type_mappings", methods=["GET"])
def get_event_type_mappings():
    try:
        data = request.get_json()  # Get data sent in POST request
        if not data:
            return jsonify({"message": "No input data provided"}), 400

        result = neo4j.execute_query(queries.GET_EVENT_TYPE_MAPPINGS)
        
        return jsonify(result)

    except Exception as e:
        # Return a 500 error with a description of the problem
        return jsonify({"message": "An error occurred: " + str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, ssl_context=('certification/cert.pem', 'certification/key.pem'))


@app.route("/events")
def events():
    # FETCH_EVENTS_FOR_MAP = """
    #     MATCH (event:Event)
    #     WHERE "2023-07-06T00:00:00" <= event.StartTimestamp <= "2023-07-06T23:59:59"
    #     OPTIONAL MATCH (event)-[r:ATTENDING]-()
    #     WITH event, count(r) as AttendeeCount
    #     MATCH (eventType:EventType)-[:RELATED_EVENT]->(event)

    #     RETURN
    #         event.Address as Address,
    #         event.CreatedByUUID as CreatedByUUID,
    #         event.Host as Host,
    #         event.Lon as Lon,
    #         event.Lat as Lat,
    #         event.StartTimestamp as StartTimestamp,
    #         event.EndTimestamp as EndTimestamp,
    #         event.EventName as EventName,
    #         event.UUID as UUID,
    #         event.EventURL as EventURL,
    #         event.Price as Price,
    #         event.FreeEventFlag as FreeEventFlag,
    #         event.EventTypeUUID as EventTypeUUID,
    #         eventType.EventType as EventType,
    #         eventType.IconURI as EventTypeIconURI,
    #         AttendeeCount;
    #     """
    # result = neo4j.execute_query(FETCH_EVENTS_FOR_MAP)
    # print(result)
    result = {
        "Email": "matt@gmail.com",
        "Username": "bigolehealz",
        "FirstName": "Matt",
        "PasswordHash": "4f31fa50e5bd5ff45684e560fc24aeee527a43739ab611c49c51098a33e2b469",
        "LastName": "Smith",
        "UUID": "87913a2f-67d9-4d37-b863-dfea86e2c207"
    }
    return {"events": result}

