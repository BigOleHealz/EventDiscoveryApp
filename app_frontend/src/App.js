// import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';  // Step 1

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
