import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-native';


import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';



export function AppHandler({ awsHandler }) {
  const [userSession, setUserSession] = useState(null);
  const [redirectRoute, setRedirectRoute] = useState(null);
  const navigate = useNavigate();

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
        element={<HomePage userSession={userSession} awsHandler={awsHandler} />} />
      <Route path="/login" element={<LoginPage setUserSession={setUserSession}/>} />
      <Route path="/create-account" element={<CreateAccountPage awsHandler={awsHandler}/>} />
    </Routes>
  );
};
