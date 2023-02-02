##### DELETES #####
DELETE_NODE_BY_ID = 'MATCH (n) where ID(n)={node_id} DETACH DELETE n;'

DELETE_ALL_EVENTS = 'MATCH (n:Event) DETACH DELETE n;'


##### GETS #####

##### GET ALL #####
GET_ALL_NODES = 'MATCH (n) RETURN n;'

GET_NODE_BY_ID = 'MATCH (n) WHERE ID(n) = {node_id} RETURN n'

GET_ALL_EVENT_TYPES = 'MATCH (n:EventType) RETURN n;'

GET_ALL_EVENT_TYPE_NAMES = 'MATCH (n:EventType) RETURN n.EventTypeID AS EventTypeID, n.EventName AS EventName;'

GET_ALL_BUSINESSES = 'MATCH (n:Business) RETURN n;'

GET_ALL_USERS = 'MATCH (n:User) RETURN n;'

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
GET_ALL_EVENTS_BY_USER = '''
                            MATCH (user:User)
                                WHERE ID(user) = {node_id}
                            WITH user
                            MATCH (event:Event)
                            WHERE 
                                ((user)-[:INVITED|:CREATED_EVENT]->(event) OR event.PublicEvent = true)
                                AND (
                                    {start_ts} <= event.StartTimestamp < {end_ts}
                                    OR
                                    {start_ts} < event.EndTimestamp <= {end_ts}
                                    OR
                                    (event.StartTimestamp <= {start_ts} AND {end_ts} <= event.EndTimestamp)
                                )
                            RETURN event;
                            '''

##### GET INIVIDUAL #####
GET_USER_BY_ID = 'MATCH (n:User {{AccountID: {account_id}}}) RETURN n.AccountID AS AccountID, n.Name AS Name LIMIT 1;'

GET_EVENT_TYPE_BY_ID = 'MATCH (n:EventType) WHERE ID(n) = {event_type_id} RETURN n;'


GET_USERS_FRIENDS_NAMES = 'MATCH (:User {{AccountID: {account_id}}})-[:FRIENDS_WITH]->(n) RETURN n.AccountID AS AccountID, n.Name AS Name;'

GET_USERS_FRIENDS_IDS = '''
                        MATCH (n:User)
                            WHERE ID(n) = {node_id}
                        WITH n
                        MATCH (f:User)
                        WHERE (n)-[:FRIENDS_WITH]->(f) RETURN id(f) AS _id;
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
