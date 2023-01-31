GET_ALL_NODES = 'MATCH (n) RETURN n;'

GET_ALL_EVENT_TYPES = 'MATCH (n:EventType) RETURN n;'

GET_ALL_EVENT_TYPE_NAMES = 'MATCH (n:EventType) RETURN n.EventTypeID AS EventTypeID, n.EventName AS EventName;'

GET_ALL_BUSINESSES = 'MATCH (n:Business) RETURN n;'

GET_ALL_USERS = 'MATCH (n:User) RETURN n;'

GET_USER_BY_ID = 'MATCH (n:User {{AccountID: {account_id}}}) RETURN n.AccountID AS AccountID, n.Name AS Name LIMIT 1;'

GET_USERS_FRIENDS = 'MATCH (:User {{AccountID: {account_id}}})-[:FRIENDS_WITH]->(n) RETURN n.AccountID AS AccountID, n.Name AS Name;'

DELETE_NODE_BY_ID = 'MATCH (n) where ID(n)={node_id} DETACH DELETE n;'

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

