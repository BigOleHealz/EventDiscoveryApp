import React, { useState } from 'react';
import { Text } from 'react-native';
import { NativeRouter as Router } from 'react-router-native';

import { AppHandler } from './AppHandler';
import { Neo4jProviderWrapper } from './db/DBHandler';
import { AWSHandlerProviderWrapper, useAWSHandler } from './utils/AWSHandler';
import ErrorBoundary from './utils/ErrorBoundary';


function MainComponent() {


  return (
        <Router>
          <AppHandler />
        </Router>
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
