import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CreateAccountPage } from './pages/CreateAccountPage';
import { CreateEventProvider, CreateUserProfileContext, LoggerContext, UserSessionContext } from './utils/Contexts';
import { formatLogStreamNameDate } from './utils/HelperFunctions';
import { Logger } from './utils/Logger'; 
import { getUserSession } from './utils/SessionManager';

export function AppHandler() {
  const [userSession, setUserSession] = useState(null);
  const [logger, setLogger] = useState(null);
  const [create_user_profile_context, setCreateUserProfileContext] = useState(null);
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
      const newLogger = new Logger({ logGroupName: 'ui/app_handler', logStreamName: `${userSession.Email}/${formatLogStreamNameDate()}` });
      setLogger(newLogger);
      navigate('/');
    }
    else {
      const newLogger = new Logger({ logGroupName: 'ui/app_handler', logStreamName: `no_user_session/${formatLogStreamNameDate()}` });
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
          <CreateUserProfileContext.Provider value={{ create_user_profile_context, setCreateUserProfileContext }}>
            <CreateEventProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-account" element={<CreateAccountPage />} />
              </Routes>
            </CreateEventProvider>
          </CreateUserProfileContext.Provider>
        </LoggerContext.Provider>
      </UserSessionContext.Provider>
    </>
  );
};
