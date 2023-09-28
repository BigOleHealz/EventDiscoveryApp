CREATE or REPLACE VIEW events_joined_view AS
SELECT 
    i.ingestion_status as i_status,
    i.ingestions_start_ts AS ingestion_start_ts,
    COALESCE(r.UUID, s.UUID) AS event_uuid,
    r.Source,
    r.SourceID,
    r.EventURL,
    r.ingestion_status,
    r.ingestion_uuid,
    r.region_id,
    r.event_start_date,
    r.s3_link,
    r.error_message,
    s.Address,
    s.EventType,
    s.EventTypeUUID,
    s.StartTimestamp,
    s.EndTimestamp,
    s.ImageURL,
    s.Host,
    s.Lon,
    s.Lat,
    s.Summary,
    s.PublicEventFlag,
    s.FreeEventFlag,
    s.Price,
    s.EventDescription,
    s.EventName,
    s.SourceEventID,
    s.EventPageURL
FROM events_raw r
LEFT JOIN events_successful s ON r.UUID = s.UUID
LEFT JOIN ingestions i ON r.ingestion_uuid = i.UUID;
