import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { Route, Routes, useNavigate, NativeRouter as Router } from 'react-router-native';
import { ToastContainer } from 'react-toastify';

import { ForgotPassword } from './pages/ForgotPassword';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { LoggerContext, UserSessionContext } from './utils/Contexts';
import { formatLogStreamNameDate } from './utils/HelperFunctions';
import { Logger } from './utils/Logger';  // import Logger
import { getUserSession } from './utils/SessionManager';
import { Neo4jProviderWrapper } from './db/DBHandler';
import { AWSHandlerProviderWrapper, useAWSHandler } from './utils/AWSHandler';
import ErrorBoundary from './utils/ErrorBoundary';



export default function App() {

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
    <ErrorBoundary>
      <Router>
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
      </Router>
    </ErrorBoundary>
  );
}
