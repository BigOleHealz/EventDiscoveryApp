import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { GET_USER_LOGIN_INFO } from '../db/queries';
import { useCustomCypherRead } from '../hooks/CustomCypherHooks';
import { hashPassword } from '../utils/HelperFunctions'
import { storeUserSession } from '../utils/SessionManager';
import styles from '../styles';

export function LoginPage({ setUserSession }) {
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
      const hashed_password = hashPassword(password);
      run_login({email : email, hashed_password : hashed_password});
    };

    useEffect(() => {
      if (login_status.STATUS === 'ERROR') {
        toast.error(`Error: ${login_status.RESPONSE}`);
        console.log(login_status.RESPONSE);
      } else if (login_status.STATUS === 'SUCCESS') {
        if (login_status.RESPONSE.RECORD_COUNT === 0) {
          toast.error(`Error: No account exists with that email & password combination.`);
        } else if (login_status.RESPONSE.RECORD_COUNT > 1) {
          toast.error(`Multiple accounts with taht email & password combination exist`);
        } else {
          const user = login_status.RESPONSE.RECORDS[0];
          storeUserSession(user);
          setUserSession(user);
          toast.success('Login Successful!');
          resetLoginInfo();
        }
        reset_login_transaction_status();
      }
    }, [login_status]);


    return (
      <>
        <ToastContainer/>
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
                style={styles.buttons.menu_button_styles}
            />
            <View style={loginPageStyles.createAccount}>
              <TextComponent>Don't have an account? </TextComponent>
              <Link to="/create-account">
                <Text style={loginPageStyles.createAccountLink}>Create One</Text>
              </Link>
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
        paddingHorizontal: 16,
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
    createAccount: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    createAccountLink: {
        color: '#2196F3',
        textDecorationLine: 'underline',
    },
});
