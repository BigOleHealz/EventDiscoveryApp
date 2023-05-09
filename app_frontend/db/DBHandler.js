import React, { useState, useEffect } from 'react';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'

import AWSHandler from '../utils/AWSHandler';


const aws_handler = new AWSHandler();

const Neo4jProviderWrapper = ({ children, onDriverLoaded }) => {
  const [neo4j_credentials, setNeo4jCredentials] = useState(null);
  const [neo4j_driver, setNeo4jDriver] = useState(null);

  useEffect(() => {
    console.log('Loading Neo4j credentials...');
    const fetchSecrets = async () => {
      const secrets = await aws_handler.getSecretValue('neo4j_credentials_public');
      if (secrets) {
        // Use the secrets, e.g., set the API key
        setNeo4jCredentials(secrets);
      }
    };

    fetchSecrets();
  }, []);

  useEffect(() => {
    if (neo4j_credentials) {
      console.log('neo4j_credentials loaded', neo4j_credentials);
      try {
        const driver = createDriver(
          neo4j_credentials.DATABASE_NAME,
          neo4j_credentials.HOST_IP,
          parseInt(neo4j_credentials.PORT, 10),
          neo4j_credentials.USER,
          neo4j_credentials.PASSWORD
        );
        setNeo4jDriver(driver);
        onDriverLoaded(true);
      } catch (error) {
        console.error('Error creating Neo4j driver:', error);
      }
    }
  }, [neo4j_credentials, onDriverLoaded]);

  if (!neo4j_driver) {
    console.log('!isDriverLoaded');
    return null;
  } else {
    console.log('Driver loaded');
    return <Neo4jProvider driver={neo4j_driver}>{children}</Neo4jProvider>;
  }
};


function recordToObject(object) {
  const obj = {};
  for (let i = 0; i < object.keys.length; i++) {
    obj[object.keys[i]] = object._fields[i];
  }
  return obj;
}

const recordsAsObjects = (objects) => {
  return objects.map(object => recordToObject(object))
};


const executeCypherQuery = ( cypher, params = {} ) => {
  if (!cypher || cypher.trim() === "") {
    console.error("Empty or undefined Cypher query detected");
    return { loading: false, error: "Empty or undefined Cypher query", records: [] };
  }
  const { loading, error, records, run } = useReadCypher(cypher);
  const [transformedRecords, setTransformedRecords] = useState([]);

  useEffect(() => {
    if (records) {
      const newTransformedRecords = records.map(record => {
        const { keys, _fields } = record;
        const recordObj = {};
        keys.forEach((key, index) => {
          recordObj[key] = _fields[index];
        });
        return recordObj;
      });
      setTransformedRecords(newTransformedRecords);
    }
  }, [records]);

  return {
    loading,
    error,
    records: transformedRecords,
    run
  };
};



// const createGameFunction = async (location, dateTime, friendInviteList, run, googleMapsApiKey, user_session) => {
//   console.log('Creating game with the following parameters:');
//   console.log('Location:', location);
//   console.log('Date & Time:', dateTime);
//   console.log('Friend Invite List:', friendInviteList);

//   console.log("dateTime: ", dateTime);
//   console.log("EventCreateAt: ", format(new Date(), date_time_format));
//   // console.log("EndTimestamp: ", format(addHours(parse(dateTime, date_time_format, new Date()), 1), date_time_format));

//   try {
//     const params = {
//       CreatedByID: user_session.UUID,
//       Address: getAddressFromCoordinates(location.lat, location.lng, googleMapsApiKey),
//       StartTimestamp: dateTime,
//       Host: user_session.Username,
//       EventCreateAt: format(new Date(), date_time_format),
//       Lon: location.lng,
//       PublicEventFlag: true,
//       EndTimestamp: format(addHours(parse(dateTime, date_time_format, new Date()), 1), date_time_format),
//       EventName: 'Pickup Basketball',
//       EventUUID: uuid.v4(),
//       Lat: location.lat
//     };

//     run(params).then((result) => {
//       console.log("result: ", result);
//     }).catch((error) => {
//       console.error(error);
//     });
//   } catch (error) {
//     console.error(error);
//   }

//   // ... (rest of the createGame function code)
// };



export {
  Neo4jProviderWrapper,
  executeCypherQuery,
  recordsAsObjects
}
