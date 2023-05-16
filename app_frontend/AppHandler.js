import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-native';
import { ToastContainer } from 'react-toastify';

import { ForgotPassword } from './pages/ForgotPassword';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';

import { getUserSession } from './utils/SessionManager';



export function AppHandler() {
  const [userSession, setUserSession] = useState(null);
  const [redirectRoute, setRedirectRoute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const session = await getUserSession();
      setUserSession(session);
    })();
  }, []);


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
    <>
      <ToastContainer />
      <Routes>
        <Route
          path="/"
          element={<HomePage userSession={userSession} setUserSession={setUserSession} />} />
        <Route path="/login" element={<LoginPage setUserSession={setUserSession} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-account" element={<CreateAccountPage />} />
      </Routes>
    </>
  );
};
