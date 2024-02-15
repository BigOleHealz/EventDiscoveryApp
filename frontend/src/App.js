import { BrowserRouter as Router } from 'react-router-dom';

import AppHandler from './AppHandler';
import ErrorBoundary from './utils/ErrorBoundary';
import './css/globals.css';


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
