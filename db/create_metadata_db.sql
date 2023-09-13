DROP TABLE IF EXISTS metadata.events_successful;
DROP TABLE IF EXISTS metadata.events_raw;
DROP TABLE IF EXISTS metadata.ingestions;
DROP TABLE IF EXISTS metadata.event_type_source_mappings;
DROP TABLE IF EXISTS metadata.dates_ingested;
DROP TABLE IF EXISTS metadata.event_types;
DROP TABLE IF EXISTS metadata.regions;
DROP TABLE IF EXISTS metadata.sources;

DROP TABLE IF EXISTS metadata.sessions;
DROP TABLE IF EXISTS metadata.users;

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
  source_event_type_mapping_id integer,
  ingestion_status varchar(255),
  ingestions_start_ts timestamp,
  success_count integer,
  error_count integer,
  virtual_count integer
);

CREATE TABLE regions (
  _id integer AUTO_INCREMENT PRIMARY KEY,
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
  _id integer AUTO_INCREMENT PRIMARY KEY,
  source_id integer,
  target_event_type_uuid varchar(255),
  source_event_type_id varchar(255),
  source_event_type_string varchar(255)
);


CREATE TABLE events_raw (
  UUID varchar(255) PRIMARY KEY,
  Source varchar(255),
  SourceID integer,
  EventURL varchar(255),
  ingestion_status varchar(255),
  ingestion_uuid varchar(255),
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

ALTER TABLE ingestions ADD FOREIGN KEY (source_id) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE ingestions ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;
ALTER TABLE ingestions ADD FOREIGN KEY (source_event_type_mapping_id) REFERENCES event_type_source_mappings (_id) ON DELETE CASCADE;
-- 
ALTER TABLE event_type_source_mappings ADD FOREIGN KEY (source_id) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE event_type_source_mappings ADD FOREIGN KEY (target_event_type_uuid) REFERENCES event_types (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE events_raw ADD FOREIGN KEY (SourceID) REFERENCES sources (_id) ON DELETE CASCADE;
ALTER TABLE events_raw ADD FOREIGN KEY (region_id) REFERENCES regions (_id) ON DELETE CASCADE;
ALTER TABLE events_raw ADD FOREIGN KEY (ingestion_uuid) REFERENCES ingestions (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE events_successful ADD FOREIGN KEY (UUID) REFERENCES events_raw (UUID) ON DELETE CASCADE;
-- 
ALTER TABLE sessions ADD FOREIGN KEY (account_uuid) REFERENCES users (UUID) ON DELETE CASCADE;
--

-- Sources
INSERT INTO sources (source,source_url) VALUES
  ('eventbrite','https://www.eventbrite.com/d/{state_code}--{city_code}/{event_type_id}--events/?page={page_no}&start_date={start_date}&end_date={end_date}'),
  ('meetup','https://www.meetup.com/find/?location={country_code}--{state_code}--{city_code}&source=EVENTS&customStartDate={start_date}&customEndDate={end_date}&distance=twentyFiveMiles&eventType=inPerson&categoryId={event_type_id}');

-- Regions
INSERT INTO regions (city_code,state_code,country_code) VALUES
  ('boston','ma','us'),
  ('philadelphia','pa','us'),
  ('miami','fl','us'),
  ('atlantic city','nj','us');

-- event_types
INSERT INTO event_types (UUID,EventType,PinColor) VALUES
  ('1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b','Science & Technology','#FF0000'),
  ('29c65158-0a9f-4b14-8606-4f6bd4798e11','Health, Fitness, Sports, Wellness, & Yoga','#FFA500'),
  ('501c8388-b139-485e-9095-8bec01fa9945','Social','#FFD700'),
  ('5398ab6b-a7fb-41cd-abde-e91ef2771170','Comedy','#20B2AA'),
  ('7abfc211-b49b-4572-8646-acb8fdfffb6c','Food & Drinks Specials','#8A2BE2'),
  ('8e2fa9d6-62d9-4439-a3ce-e22d0efd389f','Live Music & Concerts','#00FF00'),
  ('9f730660-bf2e-40a9-9b04-33831eb91471','Professional & Networking','#0000FF');

INSERT INTO event_type_source_mappings (source_id,target_event_type_uuid,source_event_type_id,source_event_type_string) VALUES
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

INSERT INTO users (UUID, Email, Username, FirstName, LastName, AccountCreatedTimestamp, TestUser) VALUES 
  ('ebd65e41-8146-40ed-9e8d-fc4ff7b75a3d', 'matt@gmail.com', 'bigolehealz', 'Matt', 'Smith', NOW(), TRUE),
  ('ca9cb31c-ddfe-4b82-b0b9-92f187a31354', 'nathan@gmail.com', 'nathansmith', 'Nathan', 'Smith', NOW(), TRUE),
  ('1eb19364-e576-4f24-944b-638382efdabf', 'paul@gmail.com', 'paulsmith', 'Paul', 'Smith', NOW(), TRUE),
  ('257d349b-ac3c-463a-890c-788d25ced059', 'mohammed@gmail.com', 'mohammedsmith', 'Mohammed', 'Smith', NOW(), TRUE),
  ('e5886a04-8062-4d36-8e37-67560c355502', 'ben@gmail.com', 'bensmith', 'Ben', 'Smith', NOW(), TRUE),
  ('dd3bbd5-296c-4cc4-b1bb-0fb47ab1923a', 'phil@gmail.com', 'philsmith', 'Phil', 'Smith', NOW(), TRUE),
  ('9b349ee-fb07-4663-afaa-0320afc5d08b', 'elior@gmail.com', 'eliorsmith', 'Elior', 'Smith', NOW(), TRUE),
  ('b4646191-9b5d-4704-a99e-b7032697d077', 'adil@gmail.com', 'adilsmith', 'Adil', 'Smith', NOW(), TRUE),
  ('8118d77d-a751-4302-917b-4d0a69d9cc44', 'nico@gmail.com', 'nicosmith', 'Nico', 'Smith', NOW(), TRUE),
  ('bfc0b276-7620-4d9f-a9a3-e80d5548691d', 'tushar@gmail.com', 'tusharsmith', 'Tushar', 'Smith', NOW(), TRUE),
  ('8ad89e7f-eb9d-41a4-8a20-2c9f121437d0', 'gabe@gmail.com', 'gabesmith', 'Gabe', 'Smith', NOW(), TRUE),
  ('63626a7f-d32d-4f90-831c-fe3716870cd9', 'dante@gmail.com', 'dantesmith', 'Dante', 'Smith', NOW(), TRUE),
  ('7987238-47e3-4132-adc6-78555dfdaac4', 'manisha@gmail.com', 'manishasmith', 'Manisha', 'Smith', NOW(), TRUE),
  ('0c816c74-5412-4c44-81d1-7c1e9d39dc62', 'scott@gmail.com', 'scottsmith', 'Scott', 'Smith', NOW(), TRUE),
  ('ae36de82-eee0-4a45-b332-afcdd30685ac', 'dummy@gmail.com', 'dummyuser', 'Dummy', 'User', NOW(), TRUE);

