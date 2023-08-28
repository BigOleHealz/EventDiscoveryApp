import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { GoogleLoginButton } from "react-social-login-buttons";
import { LoginSocialGoogle } from "reactjs-social-login";

import { TextComponent } from '../base_components/TextComponent';
import { CreateUsernameModal } from '../container_components/Modals';
import { CreateUserProfileContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { storeUserSession } from '../utils/SessionManager';
import styles from '../styles';

export function LoginPage() {

  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);
  const { user_profile_context, setUserProfileContext } = React.useContext(CreateUserProfileContext);
  const [isCreateUsernameModalVisible, setCreateUsernameModalVisible] = useState(false);


  const [fetching_user_profile, setFetchingUserLoginInfo] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState(null); // New state to store the Google ID token

  const [email, setEmail] = useState(null);
  const [first_name, setFirstName] = useState(null);
  const [last_name, setLastName] = useState(null);

  const onGoogleLoginSuccess = ({ provider, data }) => {
    // toast.success('Login Successful!');
    console.log('Google login success:', provider, data);
    console.log(provider, data);
    console.log(data.access_token)
    // setGoogleIdToken(data.access_token); 
    setEmail(data.email);
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
            toast.error('No user data returned!');
            console.error('No user data returned for email:', email);
            
            setCreateUsernameModalVisible(true);  // Show the modal if data list is empty
            return; // Don't continue processing
          }

          const user = data;
          user.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          storeUserSession(user);
          setUserSession(user);
          toast.success('Login Successful!');
          console.log('Login Successful');
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
      <View style={[loginPageStyles.container, styles.appTheme]} TestID="LoginFullPageContainer">
        <View style={styles.authContainer} TestID="LoginComponentsContainer">
          <TextComponent style={styles.h1}>Login</TextComponent>
            <View>
              <LoginSocialGoogle
                client_id={"789121404004-6144ra31e6s5ls9eknrdkejljk12oak7.apps.googleusercontent.com"}
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
            </View>
          </View>
        <CreateUsernameModal 
          isVisible={isCreateUsernameModalVisible} 
          setCreateUsernameModalVisible={setCreateUsernameModalVisible}
          onRequestClose={() => setCreateUsernameModalVisible(false)} 
          // onSubmitButtonClick={handleUsernameSubmitButtonClick}
        />
      </View>
    </>
  );
};

const loginPageStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    backgroundColor: styles.appTheme.backgroundColor,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  label: {
    width: '100%',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
  },
  forgotPassword: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  hyperlinkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  createAccount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
  },
  menu_button_styles: {
    ...styles.buttons.menu_button_styles,
    width: '50%'
  }
});



  // useEffect(() => {
  //   if (googleIdToken) {
  //     fetchUserInfo(googleIdToken);

  //   }
  // }, [googleIdToken]);


  // const fetchUserInfo = (idToken) => {
  //   // Make the API request to the specified endpoint with the Google ID token
  //   console.log("url:", `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
  //   fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // Handle the response data as needed (e.g., store user session, etc.)
  //       console.log('User Info:', data);
  //       // Example: storeUserSession(data); // Store user session information
  //       // ... other handling logic ...
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
  // };
