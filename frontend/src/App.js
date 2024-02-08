import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { useFetchGoogleMapsApiKey } from './utils/Hooks';

function App() {

  const [state, setState] = useState({});


  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);

  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey);


  return (
    <div className="App">
      {google_maps_api_key ? (
        <div>
          {google_maps_api_key}
        </div>) : (
        <div>
          Loading...
        </div>
      )
      }
    </div>
  );
}

export default App;
