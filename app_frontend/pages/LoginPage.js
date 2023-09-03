import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigate } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { GoogleLoginButton } from "react-social-login-buttons";
import { LoginSocialGoogle } from "reactjs-social-login";

import { TextComponent } from '../base_components/TextComponent';
import { getSecretValue } from '../utils/AWSHandler';
import { CreateUserProfileContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { storeUserSession } from '../utils/SessionManager';
import { common_styles, login_page_styles } from '../styles';

export function LoginPage() {

  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);

  const [googleClientId, setGoogleClientId] = useState(null);

  const navigate = useNavigate();

  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);

  useEffect(() => {
    const fetchSecrets = async () => {
      const secrets = await getSecretValue('google_oauth_credentials');
      if (secrets) {
        setGoogleClientId(JSON.parse(secrets).client_id);
      }
    };

    fetchSecrets();
  }, []);


  const onGoogleLoginSuccess = ({ provider, data }) => {
    setEmail(data.email);
    setFirstName(data.given_name);
    setLastName(data.family_name);
  };

  const resetLoginInfo = () => {
    setEmail(null);
    setFirstName(null);
    setLastName(null);
  };

  useEffect(() => {
    if (email) {
      fetch('/api/get_user_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (!data || data.length === 0) {
            toast.success('Welcome New User!');
            console.log('No user data returned for email:', email);
            setCreateUserProfileContext({
              FirstName: first_name,
              LastName: last_name,
              Email: email
            });
            navigate('/create-account');
            return;
          }
          const user = data;
          user.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          storeUserSession(user);
          setUserSession(user);
          toast.success('Login Successful!');
          logger.info(`Login Successful for email: ${email}`);
          resetLoginInfo();
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while fetching user profile!');
        });
    }
    setEmail(false);
  }, [email]);

  return (
    <>
      <ToastContainer />
      <View style={[login_page_styles.container]} TestID="LoginFullPageContainer">
        <View style={login_page_styles.authContainer} TestID="LoginComponentsContainer">
          <TextComponent style={login_page_styles.title}>Login</TextComponent>

          <View>
            {
              googleClientId && ( // Render the component only if googleClientId is not null
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
