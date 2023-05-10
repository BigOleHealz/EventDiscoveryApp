import React, { useState, useEffect } from 'react';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'


const Neo4jProviderWrapper = ({ children, onDriverLoaded, awsHandler  }) => {
  const [neo4j_credentials, setNeo4jCredentials] = useState(null);
  const [neo4j_driver, setNeo4jDriver] = useState(null);

  useEffect(() => {
    console.log('Loading Neo4j credentials...');
    const fetchSecrets = async () => {
      const secrets = await awsHandler.getSecretValue('neo4j_credentials_public');
      if (secrets) {
        // Use the secrets, e.g., set the API key
        setNeo4jCredentials(secrets);
      }
    };

    fetchSecrets();
  }, []);

  useEffect(() => {
    if (neo4j_credentials) {
      console.log('neo4j_credentials loaded');
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


const executeCypherQuery = (cypher, params = {}) => {
  if (!cypher || cypher.trim() === "") {
    console.error("Empty or undefined Cypher query detected");
    return { loading: false, error: "Empty or undefined Cypher query", records: [] };
  }

  const { loading, error, records, run } = useReadCypher(cypher, params);
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
    run,
  };
};



export {
  Neo4jProviderWrapper,
  executeCypherQuery,
  recordsAsObjects
}
