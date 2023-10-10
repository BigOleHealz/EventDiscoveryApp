import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { TextComponent } from '../base_components/TextComponent';
import { CreateUserProfileContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { useBypassLoginIfInDebugMode, useInitializeGoogleLoginButton, useSetGoogleClientId, useSetUserProfile } from '../utils/Hooks';
import { login_page_styles } from '../styles';

export function LoginPage() {

  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);

  const [fetching_google_client_id, setFetchingGoogleClientId] = useState(true);
  const [googleClientId, setGoogleClientId] = useState(null);

  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);

  const resetLoginInfo = () => {
    setEmail(null);
    setFirstName(null);
    setLastName(null);
  };

  function handleCallbackResponse(response) {
    var userObject = jwt_decode(response.credential);
    setEmail(userObject.email);
    setFirstName(userObject.given_name);
    setLastName(userObject.family_name);
  };

  useSetGoogleClientId(fetching_google_client_id, setFetchingGoogleClientId, setGoogleClientId);
  useSetUserProfile(email, setCreateUserProfileContext, setUserSession, first_name, last_name, resetLoginInfo, logger);
  useBypassLoginIfInDebugMode(setEmail, setFirstName, setLastName);
  useInitializeGoogleLoginButton(googleClientId, handleCallbackResponse);

  return (
    <>
      <ToastContainer />
      <div style={login_page_styles.container} testid="LoginFullPageContainer">
        <div id="signInDiv"></div>

        {/* <div style={login_page_styles.authContainer} testid="LoginComponentsContainer"> */}
          {/* <TextComponent style={login_page_styles.title}>Login</TextComponent> */}

        {/* </div> */}
      </div>
    </>
  );
};
