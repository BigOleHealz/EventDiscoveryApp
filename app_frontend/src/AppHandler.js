import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
// import { CreateAccountPage } from './pages/CreateAccountPage';
import {
  // CreateEventProvider,
  // CreateUserProfileContext,
  // LoggerContext,
  UserSessionContext
} from './utils/Contexts';
// import { formatLogStreamNameDate } from './utils/HelperFunctions';
// import { Logger } from './utils/Logger'; 
// import { getUserSession } from './utils/SessionManager';

export function AppHandler() {
  const [userSession, setUserSession] = useState(null);
  // const [logger, setLogger] = useState(null);
  // const [create_user_profile_context, setCreateUserProfileContext] = useState(null);
  // const [redirectRoute, setRedirectRoute] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setUserSession({
        Email: "matt.t.healy1994@gmail.com",
        Username: "yaboi",
        FirstName: "Matt",
        LastName: "Healy",
        UUID: "621df10d-3d8e-417b-a259-bdbcd0de64fd",
        Friends: [{
          "friendUUID": null,
          "friendUsername": null,
          "friendFirstName": null,
          "friendLastName": null
        }],
        Interests: ["9f730660-bf2e-40a9-9b04-33831eb91471", "29c65158-0a9f-4b14-8606-4f6bd4798e11", "7abfc211-b49b-4572-8646-acb8fdfffb6c", "8e2fa9d6-62d9-4439-a3ce-e22d0efd389f", "5398ab6b-a7fb-41cd-abde-e91ef2771170", "1f1d1c1b-1b1b-4e6e-8e0e-1e1e1d1c1b1b"]
      });
    })();
  }, []);

  useEffect(() => {
    if (userSession) {
      console.log(userSession)
    //   const newLogger = new Logger({ logGroupName: 'ui/app_handler', logStreamName: `${userSession.Email}/${formatLogStreamNameDate()}` });
    //   setLogger(newLogger);
      navigate('/');
    }
    // else {
      // const newLogger = new Logger({ logGroupName: 'ui/app_handler', logStreamName: `no_user_session/${formatLogStreamNameDate()}` });
      // setLogger(newLogger);
      // navigate('/login');
    // }
  }, [userSession]);

  return (
    <>
      <ToastContainer />
    
      <UserSessionContext.Provider value={{ userSession, setUserSession }}>
        {/* <LoggerContext.Provider value={{ logger, setLogger }}> */}
          {/* <CreateUserProfileContext.Provider value={{ create_user_profile_context, setCreateUserProfileContext }}> */}
            {/* <CreateEventProvider> */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* <Route path="/login" element={<LoginPage />} /> */}
                {/* <Route path="/create-account" element={<CreateAccountPage />} /> */}
              </Routes>
            {/* </CreateEventProvider> */}
          {/* </CreateUserProfileContext.Provider> */}
        {/* </LoggerContext.Provider> */}
      </UserSessionContext.Provider>
    </>
  );
};
