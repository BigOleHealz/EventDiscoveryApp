DROP VIEW IF EXISTS events_joined_view;
DROP VIEW IF EXISTS ingestions_joined_view;

DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS ingestions;
DROP TABLE IF EXISTS event_type_source_mappings;
DROP TABLE IF EXISTS event_types;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS sources;

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

CREATE TABLE sources (
  source varchar(255) PRIMARY KEY,
  source_url varchar(300)
);

CREATE TABLE ingestions (
  UUID varchar(255) PRIMARY KEY,
  source varchar(255),
  region_id integer,
  date date,
  source_event_type varchar(255),
  ingestion_status varchar(255),
  ingestions_start_ts timestamp,
  success_count integer,
  error_count integer,
  virtual_count integer
);

CREATE TABLE regions (
  _id integer PRIMARY KEY,
  city_code varchar(255),
  state_code varchar(255),
  country_code varchar(255)
);

CREATE TABLE event_types (
  UUID varchar(255) PRIMARY KEY,
  EventType varchar(255),
  PinColor varchar(255)
);

CREATE TABLE event_type_source_mappings (
  source_event_type varchar(255) PRIMARY KEY,
  source varchar(255),
  target_event_type_uuid varchar(255)
);

CREATE TABLE events (
  UUID varchar(255) PRIMARY KEY,
  source varchar(255),
  region_id integer,
  ingestion_uuid varchar(255),
  Address varchar(500),
  EventType varchar(255),
  EventTypeUUID varchar(255),
  StartTimestamp timestamp,
  EndTimestamp timestamp,
  ImageURL varchar(255),
  Host varchar(255),
  Lon decimal(10,8),
  Lat decimal(10,8),
  Summary varchar(255),
  PublicEventFlag boolean,
  FreeEventFlag boolean,
  Price varchar(255),
  EventDescription text,
  EventName varchar(255),
  SourceEventID varchar(255),
  EventPageURL varchar(255)
);

CREATE TABLE users (
  UUID varchar(255) PRIMARY KEY,
  Email varchar(255),
  Username varchar(255),
  FirstName varchar(255),
  LastName varchar(255),
  AccountCreatedTimestamp timestamp,
  TestUser boolean
);

CREATE TABLE sessions (
  UUID varchar(255) PRIMARY KEY,
  account_uuid varchar(255),
  session_active boolean,
  session_start_timestamp timestamp,
  session_end_timestamp timestamp
);

ALTER TABLE ingestions ADD FOREIGN KEY (source) REFERENCES sources (source) ON DELETE CASCADE;

ALTER TABLE ingestions ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;

ALTER TABLE ingestions ADD FOREIGN KEY (source_event_type) REFERENCES event_type_source_mappings (source_event_type) ON DELETE CASCADE;

ALTER TABLE event_type_source_mappings ADD FOREIGN KEY (source) REFERENCES sources (source) ON DELETE CASCADE;

ALTER TABLE event_type_source_mappings ADD FOREIGN KEY (target_event_type_uuid) REFERENCES event_types (UUID) ON DELETE CASCADE;

ALTER TABLE events ADD FOREIGN KEY (EventTypeUUID) REFERENCES event_types (UUID) ON DELETE CASCADE;

ALTER TABLE events ADD FOREIGN KEY (source) REFERENCES sources (source) ON DELETE CASCADE;

ALTER TABLE events ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;

ALTER TABLE events ADD FOREIGN KEY (ingestion_uuid) REFERENCES ingestions (UUID) ON DELETE CASCADE;

ALTER TABLE sessions ADD FOREIGN KEY (account_uuid) REFERENCES users (UUID) ON DELETE CASCADE;


INSERT INTO sources (source,source_url) VALUES
  ('google_events_api','https://api.scrape-it.cloud/scrape/google/events?q={event_type} Events in {city_code}&location={city_code}%2C{state_code}%2C{country_code}&date:{date}&start={start}')
;

INSERT INTO regions (_id,city_code,state_code,country_code) VALUES
  -- ('boston','ma','us'),
  -- ('philadelphia','pa','us'),
  (1, 'Miami','Florida','United+States')
;

INSERT INTO event_types (UUID,EventType,PinColor) VALUES
  ('1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','Science & Technology','#FF0000'),
  ('5398ab6b-a7fb-41cd-abde-e91ef2771170','Comedy','#20B2AA'),
  ('7abfc211-b49b-4572-8646-acb8fdfffb6c','Food & Drinks Specials','#8A2BE2'),
  ('8e2fa9d6-62d9-4439-a3ce-e22d0efd389f','Live Music & Concerts','#00FF00'),
  ('9f730660-bf2e-40a9-9b04-33831eb91471','Professional & Networking','#0000FF')
;

INSERT INTO event_type_source_mappings (source_event_type,source,target_event_type_uuid) VALUES
  ('Technology','google_events_api','1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b')
  -- ,
  -- ('EDM','google_events_api','8e2fa9d6-62d9-4439-a3ce-e22d0efd389f'),
  -- ('Live Music','google_events_api','8e2fa9d6-62d9-4439-a3ce-e22d0efd389f'),
  -- ('Food and Drinks Specials','google_events_api','7abfc211-b49b-4572-8646-acb8fdfffb6c'),
  -- ('Professional and Networking','google_events_api','9f730660-bf2e-40a9-9b04-33831eb91471')
;

-- CREATE or REPLACE VIEW events_joined_view AS
-- SELECT 
--     i.ingestion_status as i_status,
--     i.ingestions_start_ts AS ingestion_start_ts,
--     COALESCE(r.UUID, s.UUID) AS event_uuid,
--     r.Source,
--     r.SourceID,
--     r.EventURL,
--     r.ingestion_status,
--     r.ingestion_uuid,
--     r.region_id,
--     r.event_start_date,
--     r.s3_link,
--     r.error_message,
--     s.Address,
--     s.EventType,
--     s.EventTypeUUID,
--     s.StartTimestamp,
--     s.EndTimestamp,
--     s.ImageURL,
--     s.Host,
--     s.Lon,
--     s.Lat,
--     s.Summary,
--     s.PublicEventFlag,
--     s.FreeEventFlag,
--     s.Price,
--     s.EventDescription,
--     s.EventName,
--     s.SourceEventID,
--     s.EventPageURL
-- FROM events_raw r
-- LEFT JOIN events_successful s ON r.UUID = s.UUID
-- LEFT JOIN ingestions i ON r.ingestion_uuid = i.UUID;

-- CREATE or REPLACE VIEW ingestions_joined_view AS
-- SELECT 
--   i.date,
--   r.city_code,
--   r.state_code,
--   s.source,
--   i.UUID,
--   etsm.source_event_type_string,
--   i.ingestion_status,
--   i.ingestions_start_ts,
--   i.success_count,
--   i.error_count,
--   i.virtual_count
-- FROM ingestions i
-- LEFT JOIN regions r ON r._id = i.region_id
-- LEFT JOIN event_type_source_mappings etsm on i.source_event_type_mapping_id = etsm._id
-- LEFT JOIN sources s on s._id = etsm.source_id;
