import React, {useState} from 'react';
import { Text } from 'react-native';
import { NativeRouter as Router} from 'react-router-native';

import { AppHandler } from './AppHandler';
import { Neo4jProviderWrapper } from './db/DBHandler';
import ErrorBoundary from './utils/ErrorBoundary';


export default function App() {
  console.log("Starting App")

  const [neo4jDriverActive, setNeo4jDriverActive] = useState(false);

  return (
    <ErrorBoundary>
      <Neo4jProviderWrapper onDriverLoaded={setNeo4jDriverActive}>
        {neo4jDriverActive ? (
          <Router>
            <AppHandler />
          </Router>
        ) : (
          <Text>Connecting to Database</Text>
        )}
      </Neo4jProviderWrapper>
    </ErrorBoundary>
  );
}
