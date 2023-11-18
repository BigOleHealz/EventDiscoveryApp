import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { LoadScript } from '@react-google-maps/api';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import {
  AttendEventProvider,
  CreateEventProvider,
  CreateUserProfileContext,
  GoogleMapsApiKeyContext,
  UserAuthContext,
  // LoggerContext,
  UserSessionContext,
} from './utils/Contexts';
import { useFetchGoogleMapsApiKey, useSetGoogleClientId } from './utils/Hooks';
import { getUserSession } from './utils/SessionManager';

export function AppHandler() {
  const [user_session, setUserSession] = useState(null);
  const [logger, setLogger] = useState(null);
  const [user_auth_context, setUserAuthContext] = useState({});

  const [create_user_profile_context, setCreateUserProfileContext] = useState(null);

  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);

  const [fetching_google_client_id, setFetchingGoogleClientId] = useState(false);
  const [google_client_id, setGoogleClientId] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      const session = await getUserSession();
      console.log(session)
      setUserSession(session);
    })();
  }, []);

  useEffect(() => {
    if (user_session) {
      navigate('/');
    } else if (create_user_profile_context) {
      navigate('/create-account');
    } else {
      navigate('/login');
    }
  }, [user_session, create_user_profile_context]);

  useEffect(() => {
    if (google_client_id === false) {
      setFetchingGoogleClientId(true);
    }
  }, [google_client_id]);

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
            <UserAuthContext.Provider value={{ user_auth_context, setUserAuthContext }}>
              <UserSessionContext.Provider value={{ user_session, setUserSession }}>
                <CreateUserProfileContext.Provider value={{ create_user_profile_context, setCreateUserProfileContext }}>
                  <AttendEventProvider>
                    <CreateEventProvider>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/create-account" element={<CreateAccountPage />} />
                      </Routes>
                    </CreateEventProvider>
                  </AttendEventProvider>
                </CreateUserProfileContext.Provider>
              </UserSessionContext.Provider>
            </UserAuthContext.Provider>
          </GoogleMapsApiKeyContext.Provider>
        </GoogleOAuthProvider>
      </LoadScript>
      }
    </>
  );
};
