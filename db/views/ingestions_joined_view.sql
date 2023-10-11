CREATE or REPLACE VIEW ingestions_joined_view AS
SELECT 
  i.date,
  r.city_code,
  r.state_code,
  s.source,
  i.UUID,
  etsm.source_event_type_string,
  i.ingestion_status,
  i.ingestions_start_ts,
  i.success_count,
  i.error_count,
  i.virtual_count
FROM ingestions i
LEFT JOIN regions r ON r._id = i.region_id
LEFT JOIN event_type_source_mappings etsm on i.source_event_type_mapping_id = etsm._id
LEFT JOIN sources s on s._id = etsm.source_id;
