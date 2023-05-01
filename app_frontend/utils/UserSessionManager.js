import React, { useState, useEffect } from 'react';
import { Neo4jProvider, createDriver, useReadCypher } from 'use-neo4j'
import { executeCypherQuery } from '../db/DBHandler';
import { GET_USER_INFO } from '../db/queries';
import { storeUserSession } from './SessionManager';

export const useCypherQuery = (cypher, params = {}) => {
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

// UserSessionManager.js

export const UserSessionManager = () => {
  const { loading, error, records, run } = useCypherQuery(GET_USER_INFO);

  useEffect(() => {
    if (!loading && !error && records.length > 0) {
    
      const user = records[0];
      console.log("User session retrieved: ", user);
      storeUserSession(user);
    }
  }, [loading, error, records]);

  return null;
};
