import React, { useState, useEffect } from 'react';
import { NativeRouter as Router, Route, Link, Routes, useNavigate, Navigate } from 'react-router-native';


// Import the new pages
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage'; // Add this import
import { CreateAccountPage } from './pages/CreateAccountPage';

import styles from './styles';
// import { Toolbar } from './container_components/Toolbar';
// import { Map } from './container_components/Map';
// import { LeftSidePanel } from './container_components/Panels';
import { day_start_time, day_end_time, day_format } from './utils/constants';
import { RetrieveAndStoreUserSessionData, getUserSession } from './utils/SessionManager';


export function AppHandler() {
  // RetrieveAndStoreUserSessionData();
  const [userSession, setUserSession] = useState(null);
  const [redirectRoute, setRedirectRoute] = useState(null);
  const navigate = useNavigate();
  // useEffect(() => {
  //   const fetchUserSession = async () => {
  //     try {
  //       const session = await getUserSession();
  //       setUserSession(session);
  //     } catch (error) {
  //       console.error('Error fetching user session:', error);
  //     }
  //   };
  
  //   fetchUserSession();
  // }, []);
  useEffect(() => {

    if (userSession) {
      navigate('/');
    }
    else {
      if (redirectRoute) {
        navigate(redirectRoute);
      } else {
        navigate('/login');
      }
    }
  }, [userSession, redirectRoute]);

  return (
    <Routes>
      <Route
        path="/"
        element={userSession && <HomePage userSession={userSession} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
    </Routes>
  );
};
