##### DELETES #####
DELETE_NODE_BY_ID = 'MATCH (n) where ID(n)={node_id} DETACH DELETE n;'

DELETE_ALL_EVENTS = 'MATCH (n:Event) DETACH DELETE n;'


##### GETS #####

##### GET ALL #####
GET_ALL_NODES = 'MATCH (n) RETURN n;'

GET_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} RETURN n'

GET_ALL_USERS_NODES = 'MATCH (n:User) RETURN n;'

GET_ALL_BUSINESSES_NODES = 'MATCH (n:Business) RETURN n;'

GET_ALL_EVENT_TYPES_NODES = 'MATCH (n:EventType) RETURN n;'

GET_ALL_EVENT_TYPE_NODES = 'MATCH (n:EventType) RETURN n;'



GET_ALL_EVENT_TYPE_NAMES = 'MATCH (n:EventType) RETURN n.EventTypeID AS EventTypeID, n.EventName AS EventName;'

GET_NODE_IDS_FOR_ALL_USERS = '''
                            MATCH (n)
                            WHERE n:User
                            RETURN id(n) AS _id;
                            '''

GET_NODE_IDS_FOR_ALL_BUSINESSES_AND_USERS = '''
                                            MATCH (n)
                                            WHERE n:Business OR n:User
                                            RETURN id(n) AS _id;
                                            '''

GET_NODE_IDS_FOR_ALL_EVENT_TYPES = '''
                                    MATCH (n)
                                    WHERE n:EventType
                                    RETURN id(n) AS _id;
                                    '''
GET_EVENTS_BY_USER = '''
                    MATCH (n:User)
                        WHERE n.AccountID = {account_id}
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

GET_EVENT_BY_USER_AND_TS = '''
                            MATCH (n:User)
                                WHERE n.AccountID = {account_id}
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
                            OPTIONAL MATCH (u:User)-[r:ATTENDING]->(event)
                            OPTIONAL MATCH (et:EventType) WHERE ID(et) = event.EventTypeID
                            RETURN event as Event, COALESCE(count(r), 0) as AttendeeCount, et.EventName as EventName;
                            '''


##### GET INIVIDUAL #####
GET_USER_BY_ID = 'MATCH (n:User {{AccountID: {account_id}}}) RETURN n.AccountID AS AccountID, n.Name AS Name LIMIT 1;'

GET_EVENT_TYPE_BY_ID = 'MATCH (n:EventType) WHERE ID(n) = {event_type_id} RETURN n;'

GET_BUSINESS_BY_TITLE = '''
                        MATCH (n:Business)
                            WHERE n.Title = "{title}"
                        RETURN n;
                        '''


GET_USERS_FRIENDS_NAMES_BY_EMAIL = 'MATCH (:User {{Email: "{email}"}})-[:FRIENDS_WITH]->(n) RETURN n.AccountID AS AccountID, n.Name AS Name;'

GET_USERS_FRIENDS_IDS = '''
                        MATCH (n:User)
                            WHERE ID(n) = {node_id}
                        WITH n
                        MATCH (f:User)
                            WHERE (n)-[:FRIENDS_WITH]->(f)
                        RETURN id(f) AS _id;
                        '''

GET_ALL_EVENT_INVITED_BY_USER_ACCOUNT_ID = '''MATCH (n:User)
                                                WHERE n.AccountID = {account_id}
                                            WITH n
                                            MATCH (e:Event)
                                            WHERE 
                                                (n)-[:INVITED|:CREATED_EVENT]->(e) OR e.PublicEvent = true
                                            RETURN e;'''
                                            
GET_EVENTS_USER_IS_ATTENDING_BY_ACCOUNT_ID = '''
                                                MATCH (u:User {{AccountID:{account_id}}})-[:ATTENDING]->(e:Event)
                                                RETURN u, e;
                                                '''

GET_USER_INTERESTS = '''
                    MATCH (u:User {(AccountID: {account_id}}})-[:INTERESTED_IN]->(et:EventType)
                    RETURN et;
                    '''
                    
GET_RECOMMENDED_EVENTS_BY_ACCOUNT_ID = '''
                                        MATCH (u:User {{AccountID: {account_id}}})-[:INTERESTED_IN]->(et:EventType)
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
                                    OPTIONAL MATCH (u:User)-[r:ATTENDING]->(e)
                                    RETURN ID(e) as EventID, COALESCE(count(r), 0) as AttendeeCount;
                                    '''



##### CREATES #####
CREATE_EVENT_WITH_RELATIONSHIPS = '''MERGE (event:Event {properties})
                                    MERGE (event_type:EventType {{EventTypeID:{event_type_id}}})
                                    CREATE (event)-[:EVENT_IS_TYPE]->(event_type)
                                    WITH event
                                    MATCH {account_match_str}
                                    CREATE {account_invite_str}
                                    WITH event
                                    MATCH (creator:User {{AccountID:{creator_id}}})
                                    CREATE (creator)-[:CREATED_EVENT]->(event)
                                    CREATE (event)-[:CREATED_BY]->(creator);
                                    '''
