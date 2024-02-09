import { BrowserRouter as Router } from 'react-router-dom';

// import { AppHandler } from './AppHandler';
// import ErrorBoundary from './utils/ErrorBoundary';
// import './styles/globals.css';


function MainComponent() {
  return (
    // <Router>
    //   <AppHandler />
    // </Router>
    <div>
      <h1>Test</h1>
    </div>
  );
}

export default function App() {
  return (
    // <ErrorBoundary>
      <MainComponent />
    // </ErrorBoundary>
  );
}
