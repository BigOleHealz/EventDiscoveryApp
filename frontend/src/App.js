import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {

  const [state, setState] = useState({});


  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);

  useEffect(() => {
    if (fetching_google_maps_api_key) {
      fetch('/api/get_secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_id: 'GOOGLE_MAPS_API_KEY',
        }),
      }).then(res => res.json())
        .then(data => {
          console.log('data:', data);
          if (data) {
            setGoogleMapsApiKey(data.GOOGLE_MAPS_API_KEY);
          }
        }).catch((error) => {
          console.error('Error:', error);
        });
      setFetchingGoogleMapsApiKey(false);
    }
  }, [
    fetching_google_maps_api_key,
    setGoogleMapsApiKey,
    setFetchingGoogleMapsApiKey,
  ]);



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
