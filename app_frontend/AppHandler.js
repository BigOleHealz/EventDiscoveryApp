import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-native';
import { ToastContainer } from 'react-toastify';

import { ForgotPassword } from './pages/ForgotPassword';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { LoggerContext, UserSessionContext } from './utils/Contexts';
import { formatLogStreamNameDate } from './utils/HelperFunctions';
import { Logger } from './utils/Logger';  // import Logger
import { getUserSession } from './utils/SessionManager';


export function AppHandler() {
  const [userSession, setUserSession] = useState(null);
  const [logger, setLogger] = useState(null);
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
      const newLogger = new Logger('ui/app_handler', `${userSession.Email}/${formatLogStreamNameDate()}`);
      setLogger(newLogger);
      navigate('/');
    }
    else {
      const newLogger = new Logger('ui/app_handler', `no_user_session/${formatLogStreamNameDate()}`);
      setLogger(newLogger);
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
      <UserSessionContext.Provider value={{ userSession, setUserSession }}>
        <LoggerContext.Provider value={{ logger, setLogger }}>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>
            <Route path="/create-account" element={<CreateAccountPage/>}/>
          </Routes>
        </LoggerContext.Provider>
      </UserSessionContext.Provider>
    </>
  );
};
