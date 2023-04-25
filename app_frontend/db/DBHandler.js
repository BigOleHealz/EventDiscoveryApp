import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'
import AWSHandler from '../utils/AWSHandler';
import { REACT_APP_HOST_IP, REACT_APP_USER, REACT_APP_PASSWORD, REACT_APP_PORT, REACT_APP_DATABASE_NAME }  from '../secrets';

// Create driver instance
const awsHandler = new AWSHandler();
// const neo4j_connection_string = process.env.REACT_APP_NEO4J_CONNECTION_STRING;
// const schema_name = process.env.REACT_APP_DATABASE_NAME;


console.log(REACT_APP_HOST_IP)
console.log(REACT_APP_USER)
console.log(REACT_APP_PASSWORD)
console.log(REACT_APP_PORT)
console.log(REACT_APP_DATABASE_NAME)




const Neo4jProviderWrapper = ({ children }) => {
  const [neo4j_credentials, setNeo4jCredentials] = useState(null);

  useEffect(() => {
    const fetchSecrets = async () => {
        const secrets = await awsHandler.getSecretValue('neo4j_credentials_public');
        if (secrets) {
            // Use the secrets, e.g., set the API key
            setNeo4jCredentials(secrets);
        }
    };

    fetchSecrets();
  }, []);
  let neo4j_driver;
  if (neo4j_credentials) {
    try {
      console.log(neo4j_credentials)
      neo4j_driver = createDriver(
        REACT_APP_DATABASE_NAME,
        REACT_APP_HOST_IP,
        REACT_APP_PORT,
        REACT_APP_USER,
        REACT_APP_PASSWORD
      );
    } catch (error) {
      console.error('Error creating Neo4j driver:', error);
    }
  }
  return <Neo4jProvider driver={neo4j_driver}>{children}</Neo4jProvider>;
};

const CypherQueryHandler = ({ cypher, params={}, children }) => {
  const { loading, error, records } = useReadCypher(cypher, params);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!records) {
    return <div>No records found</div>;
  }

  if (records && records.length > 0) {
    const transformedRecords = records.map(record => {
      const { keys, _fields } = record;
      const recordObj = {};
      keys.forEach((key, index) => {
        recordObj[key] = _fields[index];
      });
      return recordObj;
    });
    return transformedRecords
  }
  
  else {
    console.log("Error while fetching records")
  }


  return children(records);
};



export { Neo4jProviderWrapper, CypherQueryHandler };
