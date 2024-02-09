import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';


import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoadScript } from '@react-google-maps/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';

import { HomePage } from './container_components/HomePage';
import {
  AttendEventProvider,
  CreateEventProvider,
  GoogleMapsApiKeyContext,
  AuthenticationContext,
  // LoggerContext,
  UserSessionContext,
} from './utils/Contexts';

import { useFetchGoogleMapsApiKey, useSetGoogleClientId } from './utils/Hooks';

export default function AppHandler() {

  const [user_session, setUserSession] = useState(null);
  const [logger, setLogger] = useState(null);
  const [authentication_context, setAuthenticationContext] = useState({});

  const [create_user_profile_context, setCreateUserProfileContext] = useState(null);

  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);


  const [fetching_google_client_id, setFetchingGoogleClientId] = useState(false);
  const [google_client_id, setGoogleClientId] = useState(false);
  const navigate = useNavigate();

  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey);
  useSetGoogleClientId(fetching_google_client_id, setFetchingGoogleClientId, setGoogleClientId);


  return (
    <>
      {google_maps_api_key && <LoadScript
        id="script-loader"
        googleMapsApiKey={google_maps_api_key}
        language="en"
      >
        <ToastContainer />
        <GoogleOAuthProvider clientId={google_client_id}>
          <GoogleMapsApiKeyContext.Provider value={google_maps_api_key}>
            <AuthenticationContext.Provider value={{ authentication_context, setAuthenticationContext }}>
              <UserSessionContext.Provider value={{ user_session, setUserSession }}>
                {/* <AttendEventProvider> */}
                  {/* <CreateEventProvider> */}
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                    </Routes>
                  {/* </CreateEventProvider> */}
                {/* </AttendEventProvider> */}
              </UserSessionContext.Provider>
            </AuthenticationContext.Provider>
          </GoogleMapsApiKeyContext.Provider>
        </GoogleOAuthProvider>
      </LoadScript>
      }
    </>
  );
}
