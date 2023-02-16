##### DELETES #####
DELETE_ALL_NODES = 'MATCH (n) DETACH DELETE n;'

DELETE_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} DETACH DELETE n'

DELETE_ALL_NODES_BY_LABEL = 'MATCH (n:{label}) DETACH DELETE n;'

DELETE_ATTENDING_RELATIONSHIP_BY_NODES_IDS = '''
                                MATCH (p:Person)-[rel:ATTENDING]->(e:Event)
                                WHERE ID(p) = {person_id} AND ID(e) = {event_id}
                                DELETE rel;
                            '''

################
##### GETS #####
################

##### GET ALL NODES#####
GET_ALL_NODES = 'MATCH (n) RETURN n;'

GET_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} RETURN n'

GET_ALL_NODES_BY_LABEL = 'MATCH (n:{label}) RETURN n;'


##### GET ALL NODE IDS BY LABEL #####
GET_ALL_NODE_IDS = 'MATCH (n) RETURN ID(n) AS _id;'

GET_ALL_NODE_IDS_BY_LABEL = 'MATCH (n:{label}) RETURN ID(n) AS _id;'

##### GET ALL NODES BY TYPE AS LIST #####

GET_EVENT_TYPE_NAMES_MAPPINGS = '''
                                MATCH (n:EventType)
                                RETURN
                                    ID(n) AS _id,
                                    n.EventName AS EventName;
                                '''


###############################
##### GET INDIVIDUAL NODE #####
###############################

GET_ACCOUNT_NODE_BY_ID = '''
                            MATCH (n:Account)
                                WHERE ID(n) = {node_id}
                            RETURN n;
                            '''

GET_ACCOUNT_NODE_BY_EMAIL = '''
                            MATCH (n:Account)
                                WHERE n.Email = "{email}"
                            RETURN n;
                            '''

GET_BUSINESS_BY_TITLE = '''
                        MATCH (n:Business)
                            WHERE n.Title = "{title}"
                        RETURN n;
                        '''

GET_EVENT_TYPE_BY_EVENTTYPEID = '''
                        MATCH (n:EventType)
                            WHERE ID(n) = {event_type_id}
                        RETURN n;
                        '''

AUTHENTICATE_ACCOUNT_EMAIL_AND_PASSWORD = '''
                                        MATCH (n:Account)
                                            WHERE
                                                n.Email = "{email}" AND n.PasswordHash = "{password_hash}"
                                        RETURN n;
                                        '''

#####################################
######## GET BY RELATIONSHIP ########
#####################################
GET_EVENTS_BY_PERSON = '''
                    MATCH (n:Person)
                        WHERE n.Email = "{email}"
                    WITH n
                    MATCH (e:Event)
                    WHERE 
                        ((n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEventFlag = true)
                        AND (
                            "{start_ts}" <= e.StartTimestamp < "{end_ts}"
                            OR
                            "{start_ts}" < e.EndTimestamp <= "{end_ts}"
                            OR
                            (e.StartTimestamp <= "{start_ts}" AND "{end_ts}" <= e.EndTimestamp)
                        )
                    RETURN e;
                    '''

GET_EVENT_BY_PERSON_AND_TS = '''
                            MATCH (n:Person)
                            WHERE n.Email = "{email}"
                            WITH n
                            MATCH (e:Event), (et:EventType)
                            WHERE 
                                (
                                    (n)-[:INVITED|:CREATED_EVENT]->(e) 
                                    OR (
                                        e.PublicEventFlag = true
                                        AND
                                        (n)-[:INTERESTED_IN]->(et)-[:RELATED_EVENT]->(e)
                                    )
                                )
                                AND (
                                    "{start_ts}" <= e.StartTimestamp < "{end_ts}"
                                    OR
                                    "{start_ts}" < e.EndTimestamp <= "{end_ts}"
                                    OR
                                    (e.StartTimestamp <= "{start_ts}" AND "{end_ts}" <= e.EndTimestamp)
                                )
                            WITH n, COLLECT(e) as events
                            UNWIND events as event
                            OPTIONAL MATCH (u:Person)-[r:ATTENDING]->(event)
                            OPTIONAL MATCH (et:EventType) WHERE ID(et) = event.EventTypeID
                            WITH n, event, COALESCE(count(r), 0) as AttendeeCount, et.EventName as EventName,
                                CASE
                                    WHEN (n)-[:ATTENDING]->(event) THEN True
                                    ELSE False
                                END as ATTENDING_BOOLEAN
                            RETURN event as Event, AttendeeCount, EventName, ATTENDING_BOOLEAN;
                            '''


GET_PERSON_FRIENDS_ID_NAME_MAPPINGS_BY_EMAIL = '''MATCH (:Person {{Email: "{email}"}})-[:FRIENDS_WITH]->(n)
                                                RETURN ID(n) as _id,
                                                n.Name AS Name;
                                                '''


GET_ALL_EVENT_INVITED = '''
                        MATCH (n:Person)
                            WHERE n.Email = "{email}"
                        WITH n
                        MATCH (e:Event)
                        WHERE 
                            (n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEvent = true
                        RETURN e;
                        '''


GET_EVENTS_PERSON_IS_ATTENDING = '''
                                MATCH (p:Person {{Email: "{email}"}})-[:ATTENDING]->(e:Event)
                                RETURN p, e;
                                '''


GET_PERSON_INTERESTS = '''
                    MATCH (u:Person {{Email: "{email}"}})-[:INTERESTED_IN]->(et:EventType)
                    RETURN et;
                    '''
                    
GET_RECOMMENDED_EVENTS = '''
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
                        '''

GET_ATTENDEE_COUNT_FOR_EVENTS_BY_ID = '''
                                        WITH {event_id_list} as event_id_list
                                        UNWIND event_id_list as event_id
                                        MATCH (e:Event) WHERE ID(e) = event_id
                                        OPTIONAL MATCH (u:Person)-[r:ATTENDING]->(e)
                                        RETURN ID(e) as EventID, COALESCE(count(r), 0) as AttendeeCount;
                                        '''


#####################
###### CREATES ######
#####################
CREATE_EVENT_WITH_RELATIONSHIPS = '''MERGE (event:Event {properties})
                                    MERGE (event_type:EventType {{EventTypeID:{event_type_id}}})
                                    CREATE (event)-[:EVENT_IS_TYPE]->(event_type)
                                    WITH event
                                    MATCH {account_match_str}
                                    CREATE {account_invite_str}
                                    WITH event
                                    MATCH (creator:Person {{AccountID:{creator_id}}})
                                    CREATE (creator)-[:CREATED_EVENT]->(event)
                                    CREATE (event)-[:CREATED_BY]->(creator);
                                    '''

CREATE_INVITE_RELATIONSHIPS_FROM_INVITE_LIST_TO_EVENT = '''
                                                        WITH {invite_list} as user_id_list, {event_id} as event_id
                                                        UNWIND user_id_list as user_id
                                                        MATCH (u:User) WHERE ID(u) = user_id
                                                        MATCH (e:Event) WHERE ID(e) = event_id
                                                        CREATE (u)-[:INVITED {properties}]->(e)
                                                        '''

CREATE_ATTENDING_RELATIONSHIP_BY_NODES_IDS = '''
                                        MATCH (p:Person), (e:Event)
                                        WHERE ID(p) = {person_id} AND ID(e) = {event_id}
                                        CREATE (p)-[:ATTENDING]->(e);
                                        '''

CREATE_ACCOUNT_INTERESTED_IN_RELATIONSHIPS = '''
                                            MATCH (a:Account), (et:EventType)
                                            WHERE ID(a) = {account_id} AND ID(et) IN {interest_id_list}
                                            CREATE (a)-[:INTERESTED_IN]->(et);
                                            '''
