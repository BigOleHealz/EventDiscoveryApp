import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoadScript } from '@react-google-maps/api';

import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
// import { CreateAccountPage } from './pages/CreateAccountPage';
import {
  CreateEventProvider,
  CreateUserProfileContext,
  GoogleMapsApiKeyContext,
  // LoggerContext,
  UserSessionContext
} from './utils/Contexts';
import { useFetchGoogleMapsApiKey } from './utils/Hooks';
import { getUserSession } from './utils/SessionManager';

export function AppHandler() {
  const [user_session, setUserSession] = useState(null);
  const [logger, setLogger] = useState(null);
  const [create_user_profile_context, setCreateUserProfileContext] = useState(null);

  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);

  // const [redirectRoute, setRedirectRoute] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      const session = await getUserSession();
      setUserSession(session);
    })();
  }, []);

  useEffect(() => {
    if (user_session) {
      console.log(user_session)
      navigate('/');
    }
    else {
      navigate('/login');
    }
  }, [user_session]);

  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey);
  
  return (
    <>
      { google_maps_api_key && <LoadScript
        id="script-loader"
        googleMapsApiKey={google_maps_api_key}
        language="en"
      >
        <ToastContainer />
        <GoogleMapsApiKeyContext.Provider value={google_maps_api_key}>
          <UserSessionContext.Provider value={{ user_session, setUserSession }}>
            <CreateUserProfileContext.Provider value={{ create_user_profile_context, setCreateUserProfileContext }}>
              <CreateEventProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  {/* <Route path="/create-account" element={<CreateAccountPage />} /> */}
                </Routes>
              </CreateEventProvider>
            </CreateUserProfileContext.Provider>
          </UserSessionContext.Provider>
        </GoogleMapsApiKeyContext.Provider>
      </LoadScript>
}
    </>
  );
};
