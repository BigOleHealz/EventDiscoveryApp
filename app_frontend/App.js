import React, { useState } from 'react';
import { Text } from 'react-native';
import { NativeRouter as Router } from 'react-router-native';

import { AppHandler } from './AppHandler';
import { Neo4jProviderWrapper } from './db/DBHandler';
import { AWSHandlerProviderWrapper, useAWSHandler } from './utils/AWSHandler';
import ErrorBoundary from './utils/ErrorBoundary';


function MainComponent() {

  const [neo4jDriverActive, setNeo4jDriverActive] = useState(false);
  // const awsHandler = useAWSHandler();

  return (
    <Neo4jProviderWrapper onDriverLoaded={setNeo4jDriverActive} >
      {neo4jDriverActive ? (
        <Router>
          <AppHandler />
        </Router>
      ) : (
        <Text>Connecting to Database</Text>
      )}
    </Neo4jProviderWrapper>
  );
}

export default function App() {

  return (
    <ErrorBoundary>
      {/* //       <AWSHandlerProviderWrapper> */}
      <MainComponent />
      {/* //       </AWSHandlerProviderWrapper> */}
    </ErrorBoundary>
  );
}
