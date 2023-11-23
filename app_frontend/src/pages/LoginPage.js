import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import Button from '@mui/material/Button';
import Typography from "@mui/material/Typography";

import BoxComponent from '../base_components/BoxComponent';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import {
  CreateUserProfileContext,
  // LoggerContext,
  UserAuthContext,
  UserSessionContext
} from '../utils/Contexts';
import { useFetchGoogleProfile, useAuthenticateUser } from '../utils/Hooks';
import { login_page_styles, button_styles, common_styles } from '../styles';

const margins = { xs: "5px", sm: "8px", md: "10px" }

export function LoginPage() {

  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);
  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { authentication_context, setUserAuthContext } = React.useContext(UserAuthContext);


  const [fetching_google_profile, setFetchingGoogleProfile] = useState(false);
  const [google_access_token, setGoogleAccessToken] = useState(null);


  const get_google_profile = (response) => {
    setGoogleAccessToken(response.access_token);
    setFetchingGoogleProfile(true);
  };

  const login = useGoogleLogin({
    onSuccess: (response) => get_google_profile(response),
    onError: (error) => console.log('Login Failed:', error)
  });

  const resetLoginInfo = () => {
    setUserAuthContext({})
  };

  useFetchGoogleProfile(fetching_google_profile, setFetchingGoogleProfile, google_access_token, setUserAuthContext);
  useAuthenticateUser(
    authentication_context,
    setCreateUserProfileContext,
    setUserSession,
    resetLoginInfo,
    // logger
  );

  return (
    <BoxComponent
      id="box-login-vertical"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }} >
      <BoxComponent style={login_page_styles.horizontalContainer}>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: "flex",
            flexGrow: 1,
            textAlign: "center",
            fontWeight: 700,
            color: "inherit",
            textDecoration: "none",
            margin: margins
          }}
        >
          Login
        </Typography>
        <Button
          onClick={() => login()}
          sx={{
            ...button_styles.menu_button_styles,
            margin: margins
          }}
        >
          Sign in with Google
        </Button>
      </BoxComponent>
    </BoxComponent>
  );
};
