import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';


import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoadScript } from '@react-google-maps/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';

import { useFetchGoogleMapsApiKey } from './utils/Hooks';

function App() {

  const [state, setState] = useState({});


  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);

  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey);


  return (
    <>
      {google_maps_api_key && <LoadScript
        id="script-loader"
        googleMapsApiKey={google_maps_api_key}
        language="en"
      >
        <ToastContainer />
        <GoogleOAuthProvider clientId={google_client_id}>
          {/* <GoogleMapsApiKeyContext.Provider value={google_maps_api_key}>
            <AuthenticationContext.Provider value={{ authentication_context, setAuthenticationContext }}>
              <UserSessionContext.Provider value={{ user_session, setUserSession }}>
                <AttendEventProvider>
                  <CreateEventProvider> */}
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                    </Routes>
                  {/* </CreateEventProvider>
                </AttendEventProvider>
              </UserSessionContext.Provider>
            </AuthenticationContext.Provider>
          </GoogleMapsApiKeyContext.Provider> */}
        </GoogleOAuthProvider>
      </LoadScript>
      }
    </>
  );
}

export default App;
