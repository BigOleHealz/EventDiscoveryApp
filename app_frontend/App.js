import React from 'react';
import { NativeRouter as Router } from 'react-router-native';

import { AppHandler } from './AppHandler';
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
      <MainComponent />
    </ErrorBoundary>
  );
}
