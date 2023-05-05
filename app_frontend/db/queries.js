// cypherQueries.js


export const CREATE_EVENT = `
    MATCH (et:EventType {EventType: 'Basketball'})
    CREATE (e:Event {
        CreatedByID: $CreatedByID,
        Address: $Address,
        StartTimestamp: $StartTimestamp,
        EventTypeID: et.UUID,
        Host: $Host,
        EventCreatedAt: $EventCreatedAt,
        Lon: $Lon,
        PublicEventFlag: $PublicEventFlag,
        EndTimestamp: $EndTimestamp,
        EventName: $EventName,
        UUID: $UUID,
        Lat: $Lat
    })
    WITH e, $FriendInviteList AS friendInviteList
    UNWIND friendInviteList AS friendUUID
    MATCH (friend:Person {UUID: friendUUID})
    CREATE (friend)-[:INVITED {INVITED_TIMESTAMP: $EventCreatedAt, INVITED_BY_UUID: $CreatedByID, STATUS: "PENDING", UUID: apoc.create.uuid()}]->(e)
    RETURN e;
    `;

export const FETCH_EVENTS_FOR_MAP = `
    MATCH (n:Event)
    WHERE "{0}" <= n.StartTimestamp <= "{1}"
    OPTIONAL MATCH (n)-[r:ATTENDING]-()
    WITH n, count(r) as AttendeeCount
    RETURN
        n.Address as Address,
        n.CreatedByID as CreatedByID,
        n.Host as Host,
        n.Lon as Lon,
        n.Lat as Lat,
        n.StartTimestamp as StartTimestamp,
        n.UUID as UUID,
        AttendeeCount,
        CASE
            WHEN datetime(n.StartTimestamp).hour < 12
            THEN toString(CASE WHEN datetime(n.StartTimestamp).hour = 0 THEN 12 ELSE datetime(n.StartTimestamp).hour % 12 END) + ":" + (CASE WHEN datetime(n.StartTimestamp).minute < 10 THEN "0" ELSE "" END) + toString(datetime(n.StartTimestamp).minute) + " AM"
            ELSE toString(CASE WHEN datetime(n.StartTimestamp).hour = 12 THEN 12 ELSE (datetime(n.StartTimestamp).hour - 12) % 12 END) + ":" + (CASE WHEN datetime(n.StartTimestamp).minute < 10 THEN "0" ELSE "" END) + toString(datetime(n.StartTimestamp).minute) + " PM"
        END as FormattedStart;
    `;
    // apoc.date.format(datetime(n.StartTimestamp).epochMillis, "ms", "HH:mm") as FormattedStart;

export const GET_USER_INFO = `
    MATCH (p:Person)-[:FRIENDS_WITH]->(friend:Person)
    WHERE p.Email = "matt@gmail.com"
    RETURN
        p.Email as Email,
        p.Username as Username,
        p.FirstName as FirstName,
        p.LastName as LastName,
        p.UUID as UUID,
        collect({
            friendUUID: friend.UUID,
            friendFirstName: friend.FirstName,
            friendLastName: friend.LastName,
            friendUsername: friend.Username
        }) as Friends;
    `;

// OPTIMIZE
export const CREATE_FRIEND_REQUEST_RELATIONSHIP = `
    MATCH (a:Person {Email: ""}), (b:Person {Email: ""})
    OPTIONAL MATCH (a)-[pending_a_to_b:FRIEND_REQUEST_SENT {STATUS: "PENDING"}]->(b)
    OPTIONAL MATCH (b)-[pending_b_to_a:FRIEND_REQUEST_SENT {STATUS: "PENDING"}]->(a)
    OPTIONAL MATCH (a)-[friends_a_to_b:FRIENDS_WITH]->(b)
    WITH a, b, pending_a_to_b, pending_b_to_a, friends_a_to_b,
        CASE
            WHEN pending_a_to_b IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "You have already sent a friend request to this person", UUID: pending_a_to_b.UUID}
            WHEN pending_b_to_a IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "This person has already sent you a friend request", UUID: pending_b_to_a.UUID}
            WHEN friends_a_to_b IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "You are already friends with this person"}
            ELSE
                NULL
        END as error
    WITH a, b, error
    WHERE error IS NULL
    CREATE (a)-[r:FRIEND_REQUEST_SENT {FRIEND_REQUEST_TIMESTAMP: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss"), STATUS: "PENDING", UUID: apoc.create.uuid()}]->(b)
    RETURN {TRANSACTION_STATUS: "SUCCESS", MESSAGE: "Friend request sent", UUID: r.UUID} as result
    UNION ALL
    MATCH (a:Person {Email: ""}), (b:Person {Email: ""})
    OPTIONAL MATCH (a)-[pending_a_to_b:FRIEND_REQUEST_SENT {STATUS: "PENDING"}]->(b)
    OPTIONAL MATCH (b)-[pending_b_to_a:FRIEND_REQUEST_SENT {STATUS: "PENDING"}]->(a)
    OPTIONAL MATCH (a)-[friends_a_to_b:FRIENDS_WITH]->(b)
    WITH a, b, pending_a_to_b, pending_b_to_a, friends_a_to_b,
        CASE
            WHEN pending_a_to_b IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "You have already sent a friend request to this person", UUID: pending_a_to_b.UUID}
            WHEN pending_b_to_a IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "This person has already sent you a friend request", UUID: pending_b_to_a.UUID}
            WHEN friends_a_to_b IS NOT NULL THEN
                {TRANSACTION_STATUS: "ERROR", MESSAGE: "You are already friends with this person"}
            ELSE
                NULL
        END as error
    WHERE error IS NOT NULL
    RETURN error as result;

    `;


export const GET_FRIEND_REQUESTS = `
    MATCH (a)-[r:FRIEND_REQUEST_SENT {STATUS: "PENDING"}]->(b {UUID: $UUID})
    RETURN 
        a.FirstName as FirstName,
        a.LastName as LastName,
        a.Username as Username,
        a.UUID as RequesterUUID,
        r.UUID as FriendRequestUUID
    ORDER BY r.FRIEND_REQUEST_TIMESTAMP DESC;
    `;

export const GET_EVENT_INVITES = `
    MATCH (n:Person {UUID: $UUID})-[r:INVITED]->(e:Event)
    MATCH (inviter:Person {UUID: r.INVITED_BY_UUID})
    WHERE r.STATUS = 'PENDING' AND datetime(e.EndTimestamp) > datetime()
    OPTIONAL MATCH (e)-[attending:ATTENDING]-()
    WITH e, inviter, r, count(attending) as AttendeeCount
    RETURN r.INVITED_BY_UUID as InviterNodeUUID,
        r.UUID as InviteRelationshipUUID,
        inviter.Username as InviterUsername,
        inviter.FirstName as InviterFirstName,
        inviter.LastName as InviterLastName,
        e.Address as Address,
        e.EventName as EventName,
        e.Host as Host,
        e.StartTimestamp as StartTimestamp,
        e.EndTimestamp as EndTimestamp,
        e.UUID as EventNodeUUID,
        AttendeeCount
    ORDER BY r.INVITED_TIMESTAMP;

    `;



export const RESPOND_TO_EVENT_INVITE = `
    WITH apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss") AS CURRENT_DATETIME
    MATCH (invitee:Account)-[r]-(event:Event)
    WHERE r.UUID = $UUID
    SET
        r.STATUS = $RESPONSE,
        r.RESPONSE_TIMESTAMP = CURRENT_DATETIME
    WITH invitee, event, r, CURRENT_DATETIME, $RESPONSE = "ACCEPTED" AS shouldCreateAttendingRelationship
    FOREACH (_ IN CASE WHEN shouldCreateAttendingRelationship THEN [1] ELSE [] END |
        MERGE (invitee)-[:ATTENDING {UUID: apoc.create.uuid(), ACCEPTED_TIMESTAMP: CURRENT_DATETIME}]->(event)
    )
    RETURN r;
    `;

export const DELETE_RELATIONSHIP_BY_UUID = `
    MATCH ()-[r]-()
    WHERE r.UUID = $UUID
    DELETE r;
    `;