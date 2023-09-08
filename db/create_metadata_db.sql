DROP TABLE IF EXISTS events_successful;
DROP TABLE IF EXISTS events_raw;
DROP TABLE IF EXISTS ingestions;
DROP TABLE IF EXISTS category_source_mappings;
DROP TABLE IF EXISTS dates_ingested;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS sources;

DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Data Ingestion Metadata
CREATE TABLE sources (
  _id integer AUTO_INCREMENT PRIMARY KEY,
  source varchar(255),
  source_url varchar(255)
);

CREATE TABLE ingestions (
  UUID varchar(255) PRIMARY KEY,
  source_id integer,
  region_id integer,
  date date,
  source_category_mapping_id integer,
  ingestion_status varchar(255),
  ingestions_start_ts timestamp,
  success_count integer,
  error_count integer,
  unmatched_count integer,
  virtual_count integer
);

CREATE TABLE regions (
  _id integer AUTO_INCREMENT PRIMARY KEY,
  city_code varchar(255),
  state_code varchar(255),
  country_code varchar(255)
);

CREATE TABLE categories (
  UUID varchar(255) PRIMARY KEY,
  EventType varchar(255),
  PinColor varchar(255)
);

CREATE TABLE category_source_mappings (
  _id integer AUTO_INCREMENT PRIMARY KEY,
  source_id integer,
  target_category_uuid varchar(255),
  source_category_id varchar(255),
  source_category_string varchar(255)
);

CREATE TABLE dates_ingested (
  date date PRIMARY KEY,
  year integer,
  month integer,
  day integer
);

CREATE TABLE events_raw (
  UUID varchar(255) PRIMARY KEY,
  SourceEventID integer,
  Source varchar(255),
  SourceID integer,
  EventURL varchar(255),
  ingestion_status varchar(255),
  ingestion_id varchar(255),
  region_id integer,
  event_start_date date,
  s3_link varchar(255),
  error_message varchar(255)
);

CREATE TABLE events_successful (
  UUID varchar(255) PRIMARY KEY,
  Address varchar(255),
  EventType varchar(255),
  EventTypeUUID varchar(255),
  StartTimestamp timestamp,
  EndTimestamp timestamp,
  ImageURL varchar(255),
  Host varchar(255),
  Lon decimal(10, 8),
  Lat decimal(10, 8),
  Summary varchar(255),
  PublicEventFlag boolean,
  FreeEventFlag boolean,
  Price varchar(255),
  EventDescription text,
  EventName varchar(255),
  SourceEventID integer,
  EventPageURL varchar(255)
);

-- User Session Metadata
CREATE TABLE users (
  UUID varchar(255) PRIMARY KEY,
  Email varchar(255),
  Username varchar(255),
  FirstName varchar(255),
  LastName varchar(255),
  AccountCreatedTimestamp timestamp
);

CREATE TABLE sessions (
  UUID varchar(255) PRIMARY KEY,
  account_uuid varchar(255),
  session_active boolean,
  session_start_timestamp timestamp,
  session_end_timestamp timestamp
);
ALTER TABLE ingestions ADD FOREIGN KEY (source_id) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE ingestions ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;
ALTER TABLE ingestions ADD FOREIGN KEY (source_category_mapping_id) REFERENCES category_source_mappings (_id) ON DELETE CASCADE;
ALTER TABLE ingestions ADD FOREIGN KEY (date) REFERENCES dates_ingested (date) ON DELETE CASCADE;
-- 
ALTER TABLE category_source_mappings ADD FOREIGN KEY (source_id) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE category_source_mappings ADD FOREIGN KEY (target_category_uuid) REFERENCES categories (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE events_raw ADD FOREIGN KEY (event_start_date) REFERENCES dates_ingested (date) ON DELETE CASCADE;
ALTER TABLE events_raw ADD FOREIGN KEY (SourceID) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE events_raw ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;
ALTER TABLE events_raw ADD FOREIGN KEY (ingestion_id) REFERENCES ingestions (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE events_successful ADD FOREIGN KEY (UUID) REFERENCES events_raw (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE sessions ADD FOREIGN KEY (account_uuid) REFERENCES users (UUID) ON DELETE CASCADE;
--

-- Sources
INSERT INTO dev.sources (source,source_url) VALUES
  ('eventbrite','https://www.eventbrite.com/d/{state_code}--{city_code}/{category_id}--events/?page={page_no}&start_date={start_date}&end_date={end_date}'),
  ('meetup','https://www.meetup.com/find/?location={country_code}--{state_code}--{city_code}&source=EVENTS&customStartDate={start_date}&customEndDate={end_date}&distance=twentyFiveMiles&eventType=inPerson&categoryId={category_id}');

-- Regions
INSERT INTO regions (city_code,state_code,country_code) VALUES
  ('boston','ma','us'),
  ('philadelphia','pa','us'),
  ('miami','fl','us'),
  ('atlantic city','nj','us');

-- Categories
INSERT INTO dev.categories (UUID,EventType,PinColor) VALUES
  ('1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','Science & Technology','#FF0000'),
  ('29c65158-0a9f-4b14-8606-4f6bd4798e11','Health, Fitness, Sports, Wellness, & Yoga','#FFA500'),
  ('501c8388-b139-485e-9095-8bec01fa9945','Social','#FFD700'),
  ('5398ab6b-a7fb-41cd-abde-e91ef2771170','Comedy','#20B2AA'),
  ('7abfc211-b49b-4572-8646-acb8fdfffb6c','Food & Drinks Specials','#8A2BE2'),
  ('8e2fa9d6-62d9-4439-a3ce-e22d0efd389f','Live Music & Concerts','#00FF00'),
  ('9f730660-bf2e-40a9-9b04-33831eb91471','Professional & Networking','#0000FF');

INSERT INTO dev.category_source_mappings (source_id,target_category_uuid,source_category_id,source_category_string) VALUES
  (1,'9f730660-bf2e-40a9-9b04-33831eb91471','business','business'),
  (1,'8e2fa9d6-62d9-4439-a3ce-e22d0efd389f','music','music'),
  (1,'7abfc211-b49b-4572-8646-acb8fdfffb6c','food-and-drink','food-and-drink'),
  (1,'29c65158-0a9f-4b14-8606-4f6bd4798e11','health','health'),
  (1,'29c65158-0a9f-4b14-8606-4f6bd4798e11','sports-and-fitness','sports-and-fitness'),
  (1,'1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','science-and-tech','science-and-tech'),
  (2,'9f730660-bf2e-40a9-9b04-33831eb91471','405','Career & Business'),
  (2,'29c65158-0a9f-4b14-8606-4f6bd4798e11','511','Health & Wellbeing'),
  (2,'8e2fa9d6-62d9-4439-a3ce-e22d0efd389f','395','Music'),
  (2,'1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','436','Science & Education'),
  (2,'29c65158-0a9f-4b14-8606-4f6bd4798e11','482','Sports & Fitness'),
  (2,'1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','546','Technology'),
  (2,'501c8388-b139-485e-9095-8bec01fa9945','652','Social Activites');
