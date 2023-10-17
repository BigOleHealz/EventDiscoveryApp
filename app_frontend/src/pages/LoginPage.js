import React, { useState, useEffect, useRef } from 'react';
import jwt_decode from "jwt-decode";
import { useGoogleLogin } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { CreateUserProfileContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { useBypassLoginIfInDebugMode, useInitializeGoogleLoginButton, useSetGoogleClientId, useSetUserProfile } from '../utils/Hooks';
import { login_page_styles } from '../styles';

export function LoginPage() {

  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);

  const [fetching_google_client_id, setFetchingGoogleClientId] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(null);

  const [ fetching_google_profile, setFetchingGoogleProfile ] = useState(false);
  const [ google_access_token, setGoogleAccessToken ] = useState(null);


  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);


  useEffect(() => {
    if (googleClientId === null) {
      setFetchingGoogleClientId(true);
    }
  }, [googleClientId]);

  const get_google_profile = (response) => {
    console.log(response.access_token)
    setGoogleAccessToken(response.access_token);
    setFetchingGoogleProfile(true);

  };
  const errorMessage = (error) => {
    console.log(error);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => get_google_profile(response),
    // onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(() => {
    if (fetching_google_profile) {
      fetch('/api/get_google_profile', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${google_access_token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_token: google_access_token
        })
      }).then(res => res.json())
        .then(data => {
          if (data) {
            toast.success('google account retrieved!');
            setFirstName(data.given_name);
            setLastName(data.family_name);
            setEmail(data.email);
            console.log(data)
          } else {
            toast.error('failed to retrieve google account' + (data.message || 'Unknown error'));
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while retrieving google account!');
        });
    }
    setFetchingGoogleProfile(false);
  }, [fetching_google_profile]);



  const resetLoginInfo = () => {
    setFirstName(null);
    setLastName(null);
    setEmail(null);
  };

  function handleCallbackResponse(response) {
    var userObject = jwt_decode(response.credential);
    setEmail(userObject.email);
    setFirstName(userObject.given_name);
    setLastName(userObject.family_name);
  };

  // useSetGoogleClientId(fetching_google_client_id, setFetchingGoogleClientId, setGoogleClientId);
  useSetUserProfile(email, setCreateUserProfileContext, setUserSession, first_name, last_name, resetLoginInfo, logger);
  useBypassLoginIfInDebugMode(setEmail, setFirstName, setLastName);
  // useInitializeGoogleLoginButton(googleClientId, handleCallbackResponse, isFirstLoginRenderRef);

  return (
    <div style={login_page_styles.verticalContainer} id="LoginFullPageContainer">
      <ToastContainer />
      <div style={login_page_styles.horizontalContainer}>
        <div>
          <TextComponent style={login_page_styles.title}>
            Login
          </TextComponent>
        </div>
        <ButtonComponent
          title="Sign in with Google"
          onPress={() => login()}
          style={{ backgroundColor: '#bbbbbb', color: '#222222'}}
        >
        </ButtonComponent>
      </div>
    </div>

  );
};
