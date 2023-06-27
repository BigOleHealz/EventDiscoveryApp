// cypherQueries.js

export const CREATE_PERSON_NODE = `
    CREATE (n:Account:Person { 
        FirstName: $first_name, 
        LastName: $last_name,
        Username: $user_name,
        Email: $email,
        PasswordHash: $hashed_password,
        UUID: apoc.create.uuid(),
        AccountCreatedTimestamp: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss")
    })
    RETURN n.UUID as UUID;
    `;

export const CREATE_ACCOUNT_INTEREST_RELATIONSHIPS = `
    MATCH (a:Account {UUID: $account_uuid}), (e:EventType)
    WHERE e.UUID IN $event_type_uuid_list
    CREATE (a)-[:INTERESTED_IN {UUID: apoc.create.uuid()}]->(e);
    `;

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
        UUID: apoc.create.uuid(),
        Lat: $Lat,
		EventDescription: "Pickup Basketball Game",
		EventTypeUUID: "3498fe08-5bbd-4a2d-b044-b10de51a5bfc"
    })
    RETURN
		e.CreatedByID as CreatedByID,
		e.Address as Address,
		e.StartTimestamp as StartTimestamp,
		e.EventTypeID as EventTypeIDUUID,
		e.Host as Host,
		e.EventCreatedAt as EventCreatedAt,
		e.Lon as Lon,
		e.PublicEventFlag as PublicEventFlag,
		e.EndTimestamp as EndTimestamp,
		e.EventName as EventName,
		e.UUID as UUID,
		e.Lat as Lat,
		e.EventDescription as EventDescription,
		e.EventTypeUUID;
    `;

export const GET_EVENT_TYPES = `
    MATCH (et:EventType)
    WHERE et.EventType <> 'Dummy Event Type'
    RETURN
        et.UUID AS UUID,
        et.EventType AS EventType
    ORDER BY EventType ASC;
    `;

export const INVITE_FRIENDS_TO_EVENT = `
    MATCH (e:Event {UUID: $event_uuid})
    WITH e, $friend_invite_list AS friendInviteList
    UNWIND friendInviteList AS friendUUID
    MATCH (friend:Person {UUID: friendUUID})
    MERGE (friend)-[:INVITED {INVITED_TIMESTAMP: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss"), INVITED_BY_UUID: $inviter_uuid, STATUS: "PENDING", UUID: apoc.create.uuid()}]->(e)
    RETURN e;
    `;

// MATCH (account:Account {UUID: $account_uuid})-[:INTERESTED_IN]->(eventType:EventType)
// WITH collect(eventType.UUID) as interestedEventTypeUUIDs
// AND event.EventTypeUUID IN interestedEventTypeUUIDs
export const FETCH_EVENTS_FOR_MAP = `
    MATCH (event:Event)
    WHERE $start_timestamp <= event.StartTimestamp <= $end_timestamp
    OPTIONAL MATCH (event)-[r:ATTENDING]-()
    WITH event, count(r) as AttendeeCount
    MATCH (eventType:EventType)-[:RELATED_EVENT]->(event)
    
    RETURN
        event.Address as Address,
        event.CreatedByID as CreatedByID,
        event.Host as Host,
        event.Lon as Lon,
        event.Lat as Lat,
        event.StartTimestamp as StartTimestamp,
        event.EndTimestamp as EndTimestamp,
        event.EventName as EventName,
        event.UUID as UUID,
        eventType.EventType as EventType,
        AttendeeCount;
    `;
// apoc.date.format(datetime(n.StartTimestamp).epochMillis, "ms", "HH:mm") as FormattedStart;

export const GET_USER_LOGIN_INFO = `
    MATCH (account:Account)
    WHERE account.Email = $email AND account.PasswordHash = $hashed_password
    OPTIONAL MATCH (account)-[:FRIENDS_WITH]->(friend:Account)
    WITH account, collect(DISTINCT {friendUUID: friend.UUID, friendFirstName: friend.FirstName, friendLastName: friend.LastName, friendUsername: friend.Username}) as Friends
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
    `;

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
// export const CREATE_FRIEND_REQUEST_RELATIONSHIP = `
//     MATCH (a:Person {Email: $sender_email}), (b:Person {Email: $recipient_email})
//     OPTIONAL MATCH (a)-[pending_a_to_b:FRIEND_REQUEST {STATUS: "PENDING"}]->(b)
//     OPTIONAL MATCH (b)-[pending_b_to_a:FRIEND_REQUEST {STATUS: "PENDING"}]->(a)
//     OPTIONAL MATCH (a)-[friends_a_to_b:FRIENDS_WITH]->(b)
//     WITH a, b, pending_a_to_b, pending_b_to_a, friends_a_to_b,
//         CASE
//             WHEN pending_a_to_b IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "You have already sent a friend request to this person", UUID: pending_a_to_b.UUID}
//             WHEN pending_b_to_a IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "This person has already sent you a friend request", UUID: pending_b_to_a.UUID}
//             WHEN friends_a_to_b IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "You are already friends with this person"}
//             ELSE
//                 NULL
//         END as error
//     WITH a, b, error
//     WHERE error IS NULL
//     CREATE (a)-[r:FRIEND_REQUEST {FRIEND_REQUEST_TIMESTAMP: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss"), STATUS: "PENDING", UUID: apoc.create.uuid()}]->(b)
//     RETURN {STATUS: "SUCCESS", MESSAGE: "Friend request sent", UUID: r.UUID} as result
//     UNION ALL
//     MATCH (a:Person {Email: $sender_email}), (b:Person {Email: $recipient_email})
//     OPTIONAL MATCH (a)-[pending_a_to_b:FRIEND_REQUEST {STATUS: "PENDING"}]->(b)
//     OPTIONAL MATCH (b)-[pending_b_to_a:FRIEND_REQUEST {STATUS: "PENDING"}]->(a)
//     OPTIONAL MATCH (a)-[friends_a_to_b:FRIENDS_WITH]->(b)
//     WITH a, b, pending_a_to_b, pending_b_to_a, friends_a_to_b,
//         CASE
//             WHEN pending_a_to_b IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "You have already sent a friend request to this person", UUID: pending_a_to_b.UUID}
//             WHEN pending_b_to_a IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "This person has already sent you a friend request", UUID: pending_b_to_a.UUID}
//             WHEN friends_a_to_b IS NOT NULL THEN
//                 {STATUS: "ERROR", MESSAGE: "You are already friends with this person"}
//             ELSE
//                 NULL
//         END as error
//     WHERE error IS NOT NULL
//     RETURN error as result;

//     `;

export const CREATE_FRIEND_REQUEST_RELATIONSHIP = `
    MATCH (a:Person {UUID: $sender_email}), (b:Person {UUID: $recipient_email})
    OPTIONAL MATCH (a)-[existingFriendRequest:FRIEND_REQUEST_SENT]->(b)
    OPTIONAL MATCH (a)<-[existingFriendRequestReverse:FRIEND_REQUEST_SENT]-(b)
    OPTIONAL MATCH (a)-[existingFriends:FRIENDS_WITH]-(b)
    WITH a, b,
        CASE
            WHEN existingFriendRequest IS NOT NULL THEN
                {STATUS: "ERROR", RESPONSE: "You have already sent a friend request to this person", UUID: existingFriendRequest.UUID}
            WHEN existingFriendRequestReverse IS NOT NULL THEN
                {STATUS: "ERROR", RESPONSE: "This person has already sent you a friend request", UUID: existingFriendRequestReverse.UUID}
            WHEN existingFriends IS NOT NULL THEN
                {STATUS: "ERROR", RESPONSE: "You are already friends with this person"}
            ELSE
                NULL
        END as error
    WITH a, b, error
    WHERE error IS NULL
    CREATE (a)-[r:FRIEND_REQUEST_SENT {FRIEND_REQUEST_TIMESTAMP: apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss"), STATUS: "PENDING", UUID: apoc.create.uuid()}]->(b)
    RETURN {STATUS: "SUCCESS", RESPONSE: "Friend request sent", UUID: r.UUID} as result
    `;

export const GET_FRIEND_REQUESTS = `
    MATCH (a)-[r:FRIEND_REQUEST {STATUS: "PENDING"}]->(b {UUID: $invitee_uuid})
    RETURN 
        a.FirstName as FirstName,
        a.LastName as LastName,
        a.Username as Username,
        a.UUID as RequesterUUID,
        r.UUID as FriendRequestUUID
    ORDER BY r.FRIEND_REQUEST_TIMESTAMP DESC;
    `;

export const GET_EVENT_INVITES = `
    MATCH (n:Person {UUID: $invitee_uuid})-[r:INVITED]->(e:Event)
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
        apoc.date.format(datetime(e.StartTimestamp).epochMillis, "ms", "hh:mm a") as FormattedStart,
        e.EndTimestamp as EndTimestamp,
        e.UUID as EventNodeUUID,
        AttendeeCount
    ORDER BY r.INVITED_TIMESTAMP;

    `;
// e.StartTimestamp as StartTimestamp,

export const RESPOND_TO_EVENT_INVITE = `
    WITH $response as RESPONSE, apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss") AS CURRENT_DATETIME
    MATCH (invitee:Account)-[r]-(event:Event)
    WHERE r.UUID = $event_invite_uuid
    SET
        r.STATUS = RESPONSE,
        r.RESPONSE_TIMESTAMP = CURRENT_DATETIME
    WITH invitee, event, r, CURRENT_DATETIME, RESPONSE = "ACCEPTED" AS shouldCreateAttendingRelationship
    FOREACH (_ IN CASE WHEN shouldCreateAttendingRelationship THEN [1] ELSE [] END |
        MERGE (invitee)-[:ATTENDING {UUID: apoc.create.uuid(), ACCEPTED_TIMESTAMP: CURRENT_DATETIME}]->(event)
    )
    RETURN r.UUID as EVENT_INVITE_UUID;
    `;

export const RESPOND_TO_FRIEND_REQUEST = `
    WITH $response as RESPONSE, apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss") AS CURRENT_DATETIME
    MATCH (friend_request_sender:Person)-[r]-(friend_request_receiver:Person)
    WHERE r.UUID = $friend_request_uuid
    SET
        r.STATUS = RESPONSE,
        r.RESPONSE_TIMESTAMP = CURRENT_DATETIME
    WITH friend_request_sender, friend_request_receiver, r, CURRENT_DATETIME, RESPONSE = "ACCEPTED" AS shouldCreateFriendsWithRelationship
    FOREACH (_ IN CASE WHEN shouldCreateFriendsWithRelationship THEN [1] ELSE [] END |
        MERGE (friend_request_sender)-[:FRIENDS_WITH {UUID: apoc.create.uuid(), FRIENDS_SINCE_TIMESTAMP: CURRENT_DATETIME}]->(friend_request_receiver)
    )
    RETURN r.UUID as FRIEND_REQUEST_UUID;
    `;

export const CREATE_ATTEND_EVENT_RELATIONSHIP = `
    MATCH (p:Person {UUID: $attendee_uuid}), (e:Event {UUID: $event_uuid})
    MERGE (p)-[r:ATTENDING]->(e)
    ON CREATE SET r.UUID = apoc.create.uuid(),
                r.ACCEPTED_TIMESTAMP = apoc.date.format(apoc.date.currentTimestamp(), "ms", "yyyy-MM-dd'T'HH:mm:ss")
    RETURN r;

    `;

export const DELETE_RELATIONSHIP_BY_UUID = `
    MATCH ()-[r]-()
    WHERE r.UUID = $UUID
    DELETE r;
    `;
