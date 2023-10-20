import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import {
  CreateUserProfileContext,
  // LoggerContext,
  UserSessionContext
} from '../utils/Contexts';
import { useFetchGoogleProfile, useSetUserProfile } from '../utils/Hooks';
import { login_page_styles } from '../styles';

export function LoginPage() {

  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);


  const [ fetching_google_profile, setFetchingGoogleProfile ] = useState(false);
  const [ google_access_token, setGoogleAccessToken ] = useState(null);


  const get_google_profile = (response) => {
    console.log(response.access_token)
    setGoogleAccessToken(response.access_token);
    setFetchingGoogleProfile(true);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => get_google_profile(response),
    onError: (error) => console.log('Login Failed:', error)
  });

  const resetLoginInfo = () => {
    setCreateUserProfileContext({})
  };

  useFetchGoogleProfile(fetching_google_profile, setFetchingGoogleProfile, google_access_token, setCreateUserProfileContext);
  useSetUserProfile(
    create_user_profile_context,
    setUserSession,
    resetLoginInfo,
    // logger
    );

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
