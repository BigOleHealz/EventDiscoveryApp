import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { GET_USER_LOGIN_INFO } from '../db/queries';
import { useCustomCypherRead } from '../hooks/CustomCypherHooks';
import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { hashPassword } from '../utils/HelperFunctions'
import { storeUserSession } from '../utils/SessionManager';
import styles from '../styles';

export function LoginPage() {

	const { userSession, setUserSession } = React.useContext(UserSessionContext);
	const { logger, setLogger } = React.useContext(LoggerContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    transactionStatus: login_status,
    executeQuery: run_login,
    resetTransactionStatus: reset_login_transaction_status
  } = useCustomCypherRead(GET_USER_LOGIN_INFO);

  const resetLoginInfo = () => {
    setEmail('');
    setPassword('');
  };

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
  };

  const handleSubmit = () => {
    logger.info(`Login attempt for email: ${email}`)
    const hashed_password = hashPassword(password);
    run_login({ email: email, hashed_password: hashed_password });
  };

  useEffect(() => {
    if (login_status.STATUS === 'ERROR') {
      const error_message = `Error: ${login_status.RESPONSE}`;
      toast.error(error_message);
      console.error(error_message);
      logger.error(error_message);
    } else if (login_status.STATUS === 'SUCCESS') {
      if (login_status.RESPONSE.RECORD_COUNT === 0) {
        const error_message = `Error: No account with email: ${email} exists`;
        toast.error(error_message);
        logger.error(error_message);

      } else if (login_status.RESPONSE.RECORD_COUNT > 1) {
        const error_message = `Error: Multiple accounts with email: ${email} exist`;
        toast.error(error_message);
        logger.error(error_message);
      } else {
        const user = login_status.RESPONSE.RECORDS[0];
        user.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        storeUserSession(user);
        setUserSession(user);
        toast.success('Login Successful!');
        logger.info(`Login Successful for email: ${email}`);
        resetLoginInfo();
      }
      reset_login_transaction_status();
    }
  }, [login_status]);


  return (
    <>
      <ToastContainer />
      <View style={[loginPageStyles.container, styles.appTheme]} TestID="LoginFullPageContainer">
        <View style={styles.authContainer} TestID="LoginComponentsContainer">
          <TextComponent style={styles.h1}>Login</TextComponent>
          <TextInputComponent
            placeholder="Enter Email"
            value={email}
            onChangeText={handleEmailChange}
          />
          <TextInputComponent
            placeholder="Enter Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={true}
          />
          <ButtonComponent
            title="Login"
            onPress={handleSubmit}
            style={loginPageStyles.menu_button_styles}
          />
          <View style={loginPageStyles.hyperlinkContainer}>
            <View style={loginPageStyles.forgotPassword}>
              <Link to="/forgot-password">
                <Text style={styles.hyperlinkText}>Forgot Password?</Text>
              </Link>
            </View>
            <View style={loginPageStyles.createAccount}>
              <TextComponent>Don't have an account? </TextComponent>
              <Link to="/create-account">
                <Text style={styles.hyperlinkText}>Create One</Text>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const loginPageStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingHorizontal: 16,
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
