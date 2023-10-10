import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { GoogleLogin } from 'react-google-login';

import { TextComponent } from '../base_components/TextComponent';
import { CreateUserProfileContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { useSetGoogleClientId, useSetUserProfile } from '../utils/Hooks';
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

  useSetGoogleClientId(fetching_google_client_id, setFetchingGoogleClientId, setGoogleClientId);
  useSetUserProfile(email, setCreateUserProfileContext, setUserSession, first_name, last_name, resetLoginInfo, logger);

  const responseGoogle = (response) => {
    if (response.error) {
      toast.error('Login Failed!');
      console.log(response.error);
    } else {
      setEmail(response.profileObj.email);
      setFirstName(response.profileObj.givenName);
      setLastName(response.profileObj.familyName);
      // You can also save the Google tokenId to your state or session if needed
    }
  };

  return (
    <>
      <ToastContainer />
      <div style={login_page_styles.container} testid="LoginFullPageContainer">
        <div style={login_page_styles.authContainer} testid="LoginComponentsContainer">
          <TextComponent style={login_page_styles.title}>Login</TextComponent>

          {googleClientId && (
            <GoogleLogin
              clientId={googleClientId}
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              buttonText="Login with Google"
              uxMode="redirect"
              redirectUri="https://bigolehealz.ninja"
            />
          
          )}
        </div>
      </div>
    </>
  );
};
