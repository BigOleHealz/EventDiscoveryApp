
SELECT_SOURCES = """
    SELECT
        source,
        source_url
    FROM
        sources;
"""

SELECT_EVENT_TYPE_SOURCE_MAPPINGS = """
    SELECT
        source_event_type,
        source,
        target_event_type_uuid
    FROM
        event_type_source_mappings;
"""

SELECT_EVENT_TYPES = """
    SELECT
        UUID as event_type_uuid,
        EventType as event_type
    FROM
        event_types;
"""

SELECT_REGIONS = """
    SELECT
        _id as region_id,
        city_code,
        state_code,
        country_code
    FROM
        regions;
"""
SELECT_INGESTION_ATTEMPTS_FOR_DATES_AFTER_TODAY = """
    SELECT
        source,
        region_id,
        date,
        source_event_type
    FROM
        ingestions
    WHERE date >= '{start_date}'
        AND
    ingestion_status = 'SUCCESS';
"""

INSERT_INGESTION_ATTEMPT = """
    INSERT INTO ingestions (
        UUID,
        source,
        region_id,
        date,
        source_event_type_mapping_id,
        ingestion_status,
        ingestions_start_ts,
        success_count,
        error_count,
        virtual_count
    ) VALUES('{UUID}', {source_id}, {region_id}, '{date}', {source_event_type_mapping_id}, 'INITIATED', CURRENT_TIMESTAMP, NULL, NULL, NULL);
"""

UPDATE_INGESTION_ATTEMPT_STATUS = """
    UPDATE ingestions
    SET ingestion_status='{status}'
    WHERE UUID='{UUID}';
"""

CHECK_IF_EVENT_EXISTS = """

    SELECT
        UUID
    FROM
        events_successful
    WHERE
        SourceEventID = {SourceEventID};
"""
    
CLOSE_INGESTION_ATTEMPT = """
    UPDATE ingestions
    SET ingestion_status='{status}',
        success_count={success_count},
        error_count={error_count},
        virtual_count={virtual_count}
    WHERE UUID='{UUID}';
"""


INSERT_EVENT_SUCCESSFULLY_INGESTED = """
    INSERT INTO events_successful (
        UUID,
        Address,
        EventType,
        EventTypeUUID,
        StartTimestamp,
        EndTimestamp,
        ImageURL,
        Host,
        Lon,
        Lat,
        Summary,
        PublicEventFlag,
        FreeEventFlag,
        Price,
        EventDescription,
        EventName,
        SourceEventID,
        EventPageURL
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    );
"""
