##### DELETES #####
DELETE_ALL_NODES = "MATCH (n) DETACH DELETE n;"

DELETE_NODE_BY_ID = "MATCH (n) WHERE ID(n) = {node_id} DETACH DELETE n"

DELETE_ALL_NODES_BY_LABEL = "MATCH (n:{label}) DETACH DELETE n;"

DELETE_ATTENDING_RELATIONSHIP_BY_NODES_IDS = """
                                MATCH (p:Person)-[rel:ATTENDING]->(e:Event)
                                WHERE ID(p) = {person_id} AND ID(e) = {event_id}
                                DELETE rel;
                            """

################
##### GETS #####
################

##### GET ALL NODES#####
GET_ALL_NODES = "MATCH (n) RETURN n;"

GET_NODE_BY_ID = "MATCH (n) WHERE ID(n) = {node_id} RETURN n"

GET_ALL_NODES_BY_LABEL = "MATCH (n:{label}) RETURN n;"


##### GET ALL NODE IDS BY LABEL #####
GET_ALL_NODE_IDS = "MATCH (n) RETURN n.UUID as UUID;"

GET_ALL_NODE_UUIDS_BY_LABEL = "MATCH (n:{label}) RETURN n.UUID AS UUID;"

##### GET ALL NODES BY TYPE AS LIST #####

GET_EVENT_TYPE_NAMES_MAPPINGS = """
                                MATCH (event:EventType)
                                WHERE event.EventType <> 'Dummy Event Type'
                                RETURN
                                    event.UUID as UUID,
                                    event.EventType AS EventType,
                                    event.PinColor as PinColor
                                ORDER BY event.EventType;
                                """


###############################
##### GET INDIVIDUAL NODE #####
###############################

GET_ACCOUNT_NODE_BY_UUID = """
                            MATCH (n:Account)
                                WHERE n.UUID = "{uuid}"
                            RETURN
                                n;
                            """
# n.Email as Email,
# n.Username as Username,
# n.FirstName as FirstName,
# n.LastName as LastName,
# n.UUID as UUID;

GET_ACCOUNT_NODE_BY_EMAIL = """
                            MATCH (n:Account)
                                WHERE n.Email = '{email}'
                            RETURN
                                n;
                            """

GET_ACCOUNT_NODE_BY_USERNAME = """
                                MATCH (n:Account)
                                    WHERE n.Username = "{username}"
                                RETURN
                                    n;
                                """

GET_ACCOUNT_NODE_BY_EMAIL_OR_USERNAME = """
                                        MATCH (n:Account)
                                            WHERE (
                                                n.Email = "{email_or_username}"
                                                OR
                                                n.Username = "{email_or_username}"
                                            )
                                        RETURN n LIMIT 1;
                                        """

GET_BUSINESS_BY_TITLE = """
                        MATCH (n:Business)
                            WHERE n.Title = "{title}"
                        RETURN n;
                        """

GET_EVENT_TYPE_BY_EVENTTYPEID = """
                        MATCH (n:EventType)
                            WHERE ID(n) = {event_type_id}
                        RETURN n;
                        """

GET_EVENT_TYPE_BY_EVENTTYPEUUID = """
                        MATCH (n:EventType)
                            WHERE n.UUID = "{event_type_uuid}"
                        RETURN n;
                        """


GET_RELATIONSHIP_BY_UUID = """
                            MATCH ()-[r]->()
                            WHERE r.UUID = "{uuid}"
                            RETURN r
                            """

GET_RELATIONSHIP_UUID_BETWEEN_NODES = """
                                MATCH (node_a {UUID: "{node_a_uuid}"})-[r:{label}]->(node_b {UUID: "{node_b_uuid}"})
                                RETURN r.UUID;


                                """

DETERMINE_IF_FRIEND_REQUESTS_ALREADY_EXISTS_OR_USERS_ALREADY_FRIENDS = """
                                                                        MATCH (a), (b)
                                                                        WHERE ID(a) = {node_a_id} AND ID(b) = {node_b_id}
                                                                        WITH a, b
                                                                        OPTIONAL MATCH (a)-[fr:FRIEND_REQUEST]->(b)
                                                                        with a, b, fr
                                                                        RETURN 
                                                                            EXISTS((a)-[:FRIENDS_WITH]->(b)) as friends_with,
                                                                            CASE
                                                                                WHEN EXISTS((a)-[:FRIEND_REQUEST]->(b)) = true
                                                                                THEN fr.STATUS
                                                                                ELSE False
                                                                            END AS friend_request_status
                                                                        ;
                                                                        """

GET_FRIEND_REQUEST_STATUS = """
                            MATCH (a), (b)
                                WHERE ID(a) = {node_a_id} AND ID(b) = {node_b_id}
                            RETURN EXISTS((a)-[:FRIEND_REQUEST]->(b)) AS friend_request_sent,
                                EXISTS((a)-[:FRIENDS_WITH]->(b)) AS friends_with;
                                MATCH (a)-[r:FRIEND_REQUEST]->(b)
                                WHERE ID(a) = {node_a_id} AND ID(b) = {node_b_id}
                            RETURN r.status
                            """


AUTHENTICATE_ACCOUNT_EMAIL_AND_PASSWORD = """
                                        MATCH (n:Account)
                                            WHERE
                                                n.Email = "{email}" AND n.PasswordHash = "{password_hash}"
                                        RETURN n;
                                        """

#####################################
######## GET BY RELATIONSHIP ########
#####################################
FETCH_EVENTS_FOR_MAP = """
    MATCH (event:Event)
    WHERE "{start_timestamp}" <= event.StartTimestamp <= "{end_timestamp}"
    OPTIONAL MATCH (event)-[r:ATTENDING]-()
    WITH event, count(r) as AttendeeCount
    MATCH (eventType:EventType)-[:RELATED_EVENT]->(event)

    RETURN
        event.Address as Address,
        event.CreatedByUUID as CreatedByUUID,
        event.Host as Host,
        event.Lon as Lon,
        event.Lat as Lat,
        event.StartTimestamp as StartTimestamp,
        event.EndTimestamp as EndTimestamp,
        event.EventName as EventName,
        event.UUID as UUID,
        event.EventURL as EventURL,
        event.Price as Price,
        event.FreeEventFlag as FreeEventFlag,
        event.EventTypeUUID as EventTypeUUID,
        eventType.EventType as EventType,
        eventType.IconURI as EventTypeIconURI,
        eventType.PinColor as PinColor,
        AttendeeCount;
    """
# GET_EVENTS_RELATED_TO_USER = """
#                             MATCH (n:Person)
#                             WHERE n.Email = "{email}"
#                             WITH n
#                             MATCH (e:Event), (et:EventType)
#                             WHERE 
#                                 (
#                                     (n)-[:INVITED|:CREATED_EVENT]->(e) 
#                                     OR (
#                                         e.PublicEventFlag = true
#                                         AND
#                                         (n)-[:INTERESTED_IN]->(et)-[:RELATED_EVENT]->(e)
#                                     )
#                                 )
#                                 AND (
#                                     "{start_ts}" <= e.StartTimestamp < "{end_ts}"
#                                     OR
#                                     "{start_ts}" < e.EndTimestamp <= "{end_ts}"
#                                     OR
#                                     (e.StartTimestamp <= "{start_ts}" AND "{end_ts}" <= e.EndTimestamp)
#                                 )
#                                 AND point.distance(point(
#                                     {{ longitude: e.Lon, latitude: e.Lat }}), 
#                                     point({{ longitude: {longitude}, latitude: {latitude} }})) <= {radius} * 1000
#                             WITH n, COLLECT(e) as events
#                             UNWIND events as event
#                             OPTIONAL MATCH (u:Person)-[r:ATTENDING]->(event)
#                             WITH n, event, COALESCE(count(r), 0) as AttendeeCount
#                             MATCH (et:EventType)
#                                 WHERE ID(et) = event.EventTypeID
#                             WITH event, AttendeeCount, et,
#                                 CASE
#                                     WHEN (n)-[:ATTENDING]->(event) THEN True
#                                     ELSE False
#                                 END as ATTENDING_BOOLEAN
#                             RETURN event as Event, AttendeeCount, et.EventType as EventType, ATTENDING_BOOLEAN;
#                             """

GET_USER_PROFILE = """
                MATCH (account:Account)
                WHERE account.Email = '{email}'
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
                """

IS_USERNAME_TAKEN = """
                    MATCH (account:Account)
                    WHERE account.Username = '{username}'
                    RETURN COUNT(account) > 0 AS usernameExists;
                    """

GET_PERSON_FRIENDS_UUID_NAME_MAPPINGS_BY_EMAIL = """
                                                MATCH (:Person {{Email: "{email}"}})-[:FRIENDS_WITH]->(n)
                                                RETURN ID(n) as _id,
                                                n.UUID as UUID,
                                                n.FirstName AS FirstName,
                                                n.LastName AS LastName;
                                                """


GET_ALL_EVENT_INVITED = """
                        MATCH (n:Person)
                            WHERE n.Email = "{email}"
                        WITH n
                        MATCH (e:Event)
                        WHERE 
                            (n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEvent = true
                        RETURN e;
                        """


GET_EVENTS_PERSON_IS_ATTENDING = """
                                MATCH (p:Person {{Email: "{email}"}})-[:ATTENDING]->(e:Event)
                                RETURN p, e;
                                """


GET_PERSON_INTERESTS = """
                    MATCH (u:Person {{Email: "{email}"}})-[:INTERESTED_IN]->(et:EventType)
                    RETURN et;
                    """

GET_RECOMMENDED_EVENTS = """
                        MATCH (u:Person {{Email: "{email}"}})-[:INTERESTED_IN]->(et:EventType)
                        WITH u, et
                        MATCH (et:EventType)-[:RELATED_EVENT]->(e:Event)
                        WHERE NOT (u)-[:ATTENDING]->(e)
                        AND (
                            datetime(e.StartTimestamp) > datetime()
                                AND
                            datetime(e.StartTimestamp) <= datetime() + duration({{days: 7}})
                            )
                        RETURN e;
                        """

GET_ATTENDEE_COUNT_FOR_EVENTS_BY_ID = """
                                        WITH {event_id_list} as event_id_list
                                        UNWIND event_id_list as event_id
                                        MATCH (e:Event) WHERE ID(e) = event_id
                                        OPTIONAL MATCH (u:Person)-[r:ATTENDING]->(e)
                                        RETURN ID(e) as EventID, COALESCE(count(r), 0) as AttendeeCount;
                                        """

GET_PENDING_FRIEND_REQUESTS = """
                            MATCH (p:Person)<-[r:FRIEND_REQUEST]-(q:Person)
                                WHERE p.Email = "{email}"
                                AND
                                r.STATUS = "PENDING"
                            RETURN r AS RELATIONSHIP, type(r) AS NOTIFICATION_TYPE, q AS NOTIFICATION_DETAILS;
                            """

GET_PENDING_EVENT_INVITES = """
                            MATCH (p:Person)
                            WHERE
                                p.Email = "{email}"
                            WITH p
                            MATCH (p)-[r:INVITED]->(e:Event)
                            WHERE
                                r.STATUS = "PENDING"
                            WITH r, type(r) AS NOTIFICATION_TYPE, e AS NOTIFICATION_DETAILS
                            ORDER BY r.INVITED_DATE
                            RETURN r AS RELATIONSHIP, NOTIFICATION_TYPE, NOTIFICATION_DETAILS;
                            """

GET_NOTIFICATIONS = """
                    MATCH (p2:Person)
                    WHERE
                        p2.Email = "{email}"
                    WITH p2
                    MATCH (p1:Person)-[r:FRIEND_REQUEST]->(p2)
                    WHERE
                        r.STATUS = "PENDING"
                    RETURN type(r) AS NOTIFICATION_TYPE, p1 AS NOTIFICATION_DETAILS          
                    UNION
                    MATCH (p2)-[r:INVITED]->(e:Event)
                    WHERE
                        r.STATUS = "PENDING"
                    RETURN type(r) AS NOTIFICATION_TYPE, e AS NOTIFICATION_DETAILS;
                    """

#####################
###### CREATES ######
#####################


CREATE_PERSON_NODE = """
    CREATE (n:Account:Person {{
        FirstName: "{first_name}", 
        LastName: "{last_name}",
        Email: "{email}",
        Username: "{username}",
        UUID: "{uuid}",
        AccountCreatedTimestamp: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss")
    }})
    FOREACH (interestUUID IN {interest_uuids} |
        MERGE (e:EventType {{UUID: interestUUID}})
        MERGE (n)-[:INTERESTED_IN {{UUID: apoc.create.uuid()}}]->(e)
    )
    
    RETURN n.UUID as UUID;
    """


CHECK_IF_EVENT_EXISTS = r"""
                    MATCH (e:Event {Source: $params.Source, SourceEventID: $params.SourceEventID})
                    RETURN e.UUID as EventUUID;
                    """

CREATE_EVENT_IF_NOT_EXISTS=r"""
                            MERGE (e:Event {Source: $params.Source, SourceEventID: $params.SourceEventID})
                            ON CREATE SET e += $params
                            WITH e, $params as params
                            MATCH (et:EventType {UUID: params.EventTypeUUID})
                            MERGE (et)-[:RELATED_EVENT]->(e)
                            WITH e, params
                            OPTIONAL MATCH (a:Account {UUID: params.CreatedByUUID})
                            MERGE (a)-[:CREATED_EVENT]->(e);
                            """

CREATE_EVENT_WITH_RELATIONSHIPS = """MERGE (event:Event {properties})
                                    MERGE (event_type:EventType {{EventTypeID:{event_type_id}}})
                                    CREATE (event)-[:EVENT_IS_TYPE]->(event_type)
                                    WITH event
                                    MATCH {account_match_str}
                                    CREATE {account_invite_str}
                                    WITH event
                                    MATCH (creator:Person {{AccountID:{creator_id}}})
                                    CREATE (creator)-[:CREATED_EVENT]->(event)
                                    CREATE (event)-[:CREATED_BY]->(creator);
                                    """

CREATE_INVITE_RELATIONSHIPS_FROM_INVITE_LIST_TO_EVENT = """
                                                        WITH {invite_list} as user_id_list, {event_id} as event_id
                                                        UNWIND user_id_list as user_id
                                                        MATCH (u:User) WHERE ID(u) = user_id
                                                        MATCH (e:Event) WHERE ID(e) = event_id
                                                        CREATE (u)-[:INVITED {properties}]->(e)
                                                        """

CREATE_ATTENDING_RELATIONSHIP_BY_NODES_IDS = """
                                        MATCH (p:Person), (e:Event)
                                        WHERE ID(p) = {person_id} AND ID(e) = {event_id}
                                        CREATE (p)-[:ATTENDING]->(e);
                                        """

CREATE_ACCOUNT_INTERESTED_IN_RELATIONSHIPS = """
                                            MATCH (a:Account), (et:EventType)
                                            WHERE ID(a) = {account_id} AND ID(et) IN {interest_id_list}
                                            CREATE (a)-[:INTERESTED_IN]->(et);
                                            """

CREATE_ACCOUNT_INTERESTED_IN_RELATIONSHIPS_BY_MANUALLY_ASSIGNED_ID = """
                                                                    MATCH (a:Account), (et:EventType)
                                                                    WHERE ID(a) = {account_id} AND et.UUID IN {interest_id_list}
                                                                    CREATE (a)-[:INTERESTED_IN]->(et);
                                                                    """

CREATE_FRIEND_REQUEST_BY_ID = """
                            MATCH (a), (b)
                            WHERE ID(a) = {node_a_id} AND ID(b) = {node_b_id}
                            CREATE (a)-[r:FRIEND_REQUEST {properties}]->(b)
                            RETURN r;
                            """

CREATE_FRIENDSHIP = """
                    MATCH (a:Person), (b:Person)
                    WHERE ID(a) = {node_a_id} AND ID(b) = {node_b_id}
                    WITH a, b, datetime() as dt
                    CREATE (a)-[abr:FRIENDS_WITH {properties}]->(b)
                    SET abr.FRIENDS_SINCE = dt
                    CREATE (b)-[bar:FRIENDS_WITH {properties}]->(a)
                    SET bar.FRIENDS_SINCE = dt
                    RETURN abr, bar;
                    """
