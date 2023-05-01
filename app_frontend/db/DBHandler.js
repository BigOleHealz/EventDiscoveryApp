import React, { useState, useEffect } from 'react';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'

import AWSHandler from '../utils/AWSHandler';


const aws_handler = new AWSHandler();

const Neo4jProviderWrapper = ({ children }) => {
  const [neo4j_credentials, setNeo4jCredentials] = useState(null);

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
  if (neo4j_credentials) {
    try {
      const neo4j_driver = createDriver(
        neo4j_credentials.DATABASE_NAME,
        neo4j_credentials.HOST_IP,
        parseInt(neo4j_credentials.PORT, 10),
        neo4j_credentials.USER,
        neo4j_credentials.PASSWORD
      );
      return <Neo4jProvider driver={neo4j_driver}>{children}</Neo4jProvider>;
    } catch (error) {
      console.error('Error creating Neo4j driver:', error);
    }
  } else {
    return (
      <div>
        <p>Error: Neo4j credentials not available.</p>
      </div>
    );

  }
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
}
