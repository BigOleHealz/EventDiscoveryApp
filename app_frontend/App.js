import React from 'react';

import { AppHandler } from './AppHandler';
import { Neo4jProviderWrapper } from './db/DBHandler';
import ErrorBoundary from './utils/ErrorBoundary';


export default function App() {

  return (
    <ErrorBoundary>
      <Neo4jProviderWrapper>
        <AppHandler/>
      </Neo4jProviderWrapper>
    </ErrorBoundary>
  );
};
