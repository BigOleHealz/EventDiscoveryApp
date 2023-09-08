import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigate } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { GoogleLoginButton } from "react-social-login-buttons";
import { LoginSocialGoogle } from "reactjs-social-login";

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

  const onGoogleLoginSuccess = ({ provider, data }) => {
    setEmail(data.email);
    setFirstName(data.given_name);
    setLastName(data.family_name);
  };


  return (
    <>
      <ToastContainer />
      <View style={[login_page_styles.container]} TestID="LoginFullPageContainer">
        <View style={login_page_styles.authContainer} TestID="LoginComponentsContainer">
          <TextComponent style={login_page_styles.title}>Login</TextComponent>

          <View>
            {
              googleClientId && (
                <LoginSocialGoogle
                  client_id={googleClientId}
                  scope="openid profile email"
                  discoveryDocs="claims_supported"
                  access_type="offline"
                  onResolve={onGoogleLoginSuccess}
                  onReject={(err) => {
                    toast.error('Login Failed!');
                    console.log(err);
                  }}
                >
                  <GoogleLoginButton />
                </LoginSocialGoogle>
              )
            }
          </View>
        </View>
      </View>
    </>
  );
};
