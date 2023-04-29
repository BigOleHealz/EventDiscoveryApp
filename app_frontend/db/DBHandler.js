import React, { useState, useEffect } from 'react';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'
import AWSHandler from '../utils/AWSHandler';

const awsHandler = new AWSHandler();


const Neo4jProviderWrapper = ({ children }) => {
  const [neo4j_credentials, setNeo4jCredentials] = useState(null);

  useEffect(() => {
    console.log('Loading Neo4j credentials...');
    const fetchSecrets = async () => {
        const secrets = await awsHandler.getSecretValue('neo4j_credentials_public');
        if (secrets) {
          console.log('Neo4j credentials retrieved:', secrets);
            // Use the secrets, e.g., set the API key
            setNeo4jCredentials(secrets);
        }
    };

    fetchSecrets();
  }, []);
  if (neo4j_credentials) {
    try {
      console.log(neo4j_credentials);
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


const substituteParamsInQuery = (query, params) => {
  return Object.keys(params).reduce((updatedQuery, key) => {
    const value = JSON.stringify(params[key]);
    const placeholder = new RegExp(`\\$\{${key}\\}`, 'g');
    return updatedQuery.replace(placeholder, value);
  }, query);
};


const useCypherQueryHandler = ( cypher, params = {} ) => {
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
      console.log("newTransformedRecords", newTransformedRecords);
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


function formatString(template, ...args) {
  return template.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}


export { Neo4jProviderWrapper, useCypherQueryHandler, formatString };
