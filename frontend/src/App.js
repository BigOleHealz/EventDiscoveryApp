import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import AppHandler from './AppHandler';
import ErrorBoundary from './utils/ErrorBoundary';
import './css/globals.css';


function MainComponent() {
  return (
    <>
      <Helmet>
        <title>FunctionFinder</title>
      </Helmet>
      <Router>
        <AppHandler />
      </Router>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainComponent />
    </ErrorBoundary>
  );
}
