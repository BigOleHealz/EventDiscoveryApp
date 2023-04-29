// cypherQueries.js

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
        END as FormattedStart
    LIMIT 5;
    `;
