CREATE CONSTRAINT FOR (n:Person) REQUIRE n.Email IS UNIQUE;
CREATE CONSTRAINT FOR (n:Person) REQUIRE n.UUID IS UNIQUE;
CREATE CONSTRAINT FOR (n:Person) REQUIRE n.Username IS UNIQUE;
CREATE CONSTRAINT FOR (event:Event) REQUIRE event.UUID IS UNIQUE;


MERGE (e1:EventType {UUID: '1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b'})
  ON CREATE SET e1.EventType = 'Science & Technology', e1.PinColor = '#FF0000'
MERGE (e2:EventType {UUID: '29c65158-0a9f-4b14-8606-4f6bd4798e11'})
  ON CREATE SET e2.EventType = 'Health, Fitness, Sports, Wellness, & Yoga', e2.PinColor = '#FFA500'
MERGE (e3:EventType {UUID: '501c8388-b139-485e-9095-8bec01fa9945'})
  ON CREATE SET e3.EventType = 'Social', e3.PinColor = '#FFD700'
MERGE (e4:EventType {UUID: '5398ab6b-a7fb-41cd-abde-e91ef2771170'})
  ON CREATE SET e4.EventType = 'Comedy', e4.PinColor = '#20B2AA'
MERGE (e5:EventType {UUID: '7abfc211-b49b-4572-8646-acb8fdfffb6c'})
  ON CREATE SET e5.EventType = 'Food & Drinks Specials', e5.PinColor = '#8A2BE2'
MERGE (e6:EventType {UUID: '8e2fa9d6-62d9-4439-a3ce-e22d0efd389f'})
  ON CREATE SET e6.EventType = 'Live Music & Concerts', e6.PinColor = '#00FF00'
MERGE (e7:EventType {UUID: '9f730660-bf2e-40a9-9b04-33831eb91471'})
  ON CREATE SET e7.EventType = 'Professional & Networking', e7.PinColor = '#0000FF';
