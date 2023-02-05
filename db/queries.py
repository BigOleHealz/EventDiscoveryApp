##### DELETES #####
DELETE_ALL_NODES = 'MATCH (n) DETACH DELETE n;'

DELETE_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} DETACH DELETE n'

DELETE_ALL_ACCOUNT_NODES = 'MATCH (n:Account) DETACH DELETE n;'

DELETE_ALL_PERSON_NODES = 'MATCH (n:Person) DETACH DELETE n;'

DELETE_ALL_BUSINESS_NODES = 'MATCH (n:Business) DETACH DELETE n;'

DELETE_ALL_EVENT_TYPE_NODES = 'MATCH (n:EventType) DETACH DELETE n;'

DELETE_ALL_EVENT_NODES = 'MATCH (n:Event) DETACH DELETE n;'


##### GETS #####

##### GET ALL #####
GET_ALL_NODES = 'MATCH (n) RETURN n;'

GET_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} RETURN n'

GET_ALL_ACCOUNT_NODES = 'MATCH (n:Account) RETURN n;'

GET_ALL_PERSON_NODES = 'MATCH (n:Person) RETURN n;'

GET_ALL_BUSINESS_NODES = 'MATCH (n:Business) RETURN n;'

GET_ALL_EVENT_TYPE_NODES = 'MATCH (n:EventType) RETURN n;'

GET_ALL_EVENT_NODES = 'MATCH (n:Event) RETURN n;'



GET_ALL_EVENT_TYPE_NAMES = '''
                            MATCH (n:EventType)
                            RETURN
                                n.EventTypeID AS EventTypeID,
                                n.EventName AS EventName;
                            '''

GET_NODE_IDS_FOR_ALL_PERSONS = '''
                                MATCH (n)
                                WHERE n:Person
                                RETURN id(n) AS _id;
                                '''

GET_NODE_IDS_FOR_ALL_BUSINESSES_AND_PERSONS = '''
                                            MATCH (n)
                                            WHERE n:Business OR n:Person
                                            RETURN id(n) AS _id;
                                            '''

GET_NODE_IDS_FOR_ALL_EVENT_TYPES = '''
                                    MATCH (n)
                                    WHERE n:EventType
                                    RETURN id(n) AS _id;
                                    '''
GET_EVENTS_BY_PERSON = '''
                    MATCH (n:Person)
                        WHERE n.Email = "{email}"
                    WITH n
                    MATCH (e:Event)
                    WHERE 
                        ((n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEvent = true)
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
                            MATCH (e:Event)
                            WHERE 
                                ((n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEvent = true)
                                AND (
                                    "{start_ts}" <= e.StartTimestamp < "{end_ts}"
                                    OR
                                    "{start_ts}" < e.EndTimestamp <= "{end_ts}"
                                    OR
                                    (e.StartTimestamp <= "{start_ts}" AND "{end_ts}" <= e.EndTimestamp)
                                )
                            WITH COLLECT(e) as events
                            UNWIND events as event
                            OPTIONAL MATCH (u:Person)-[r:ATTENDING]->(event)
                            OPTIONAL MATCH (et:EventType) WHERE ID(et) = event.EventTypeID
                            RETURN event as Event, COALESCE(count(r), 0) as AttendeeCount, et.EventName as EventName;
                            '''


##### GET INIVIDUAL #####
GET_ACCOUNT_NODE_BY_EMAIL = '''
                            MATCH (n:Account)
                                WHERE n.Email = "{email}"
                            RETURN n;
                            '''

GET_EVENT_TYPE_BY_EVENTTYPEID = '''
                        MATCH (n:EventType)
                            WHERE n.EventTypeID = {event_type_id}
                        RETURN n;
                        '''

# GET_BUSINESS_BY_TITLE = '''
#                         MATCH (n:Business)
#                             WHERE n.Title = "{title}"
#                         RETURN n;
#                         '''


GET_PERSON_FRIENDS_NAMES_BY_EMAIL = '''MATCH (:Person {{Email: "{email}"}})-[:FRIENDS_WITH]->(n)
                                    RETURN ID(n) as ID,
                                    n.Name AS Name;
                                    '''

GET_PERSON_FRIENDS_IDS = '''
                        MATCH (n:Person)
                            WHERE n.Email = "{email}"
                        WITH n
                        MATCH (f:Person)
                            WHERE (n)-[:FRIENDS_WITH]->(f)
                        RETURN id(f) AS _id;
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


CREATE_INVITE_RELATIONSHIPS_FROM_INVITE_LIST_TO_EVENT = '''
                                                        WITH {invite_list} as user_id_list, {event_id} as event_id
                                                        UNWIND user_id_list as user_id
                                                        MATCH (u:User) WHERE ID(u) = user_id
                                                        MATCH (e:Event) WHERE ID(e) = event_id
                                                        CREATE (u)-[:INVITED {properties}]->(e)
                                                        '''
# ##### CREATES #####
# CREATE_EVENT_WITH_RELATIONSHIPS = '''MERGE (event:Event {properties})
#                                     MERGE (event_type:EventType {{EventTypeID:{event_type_id}}})
#                                     CREATE (event)-[:EVENT_IS_TYPE]->(event_type)
#                                     WITH event
#                                     MATCH {account_match_str}
#                                     CREATE {account_invite_str}
#                                     WITH event
#                                     MATCH (creator:Person {{AccountID:{creator_id}}})
#                                     CREATE (creator)-[:CREATED_EVENT]->(event)
#                                     CREATE (event)-[:CREATED_BY]->(creator);
#                                     '''
