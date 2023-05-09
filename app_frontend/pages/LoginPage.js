import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';
import { useReadCypher } from 'use-neo4j';



import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { GET_USER_LOGIN_INFO } from '../db/queries';
import { recordsAsObjects  } from '../db/DBHandler';
import { hashPassword } from '../utils/HelperFunctions'
import { storeUserSession } from '../utils/SessionManager';
import styles from '../styles';

export function LoginPage({ setUserSession }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [runLoginQuery, setRunLoginQuery] = useState(false);
    const [getAccountLoginInfoTransactionStatus, setGetAccountLoginInfoTransactionStatus] = useState(false);

    const resetLoginInfo = () => {
      setEmail('');
      setPassword('');
    };


    const { loading, error, records, run } = useReadCypher(GET_USER_LOGIN_INFO);

    useEffect(() => {
      const get_user_info = async () => {
        if (runLoginQuery) {
          const hashed_password = hashPassword(password);
    
          const params = {
            email: email,
            hashed_password: hashed_password
          };
          console.log('params', params);
          run(params);
  
          setRunLoginQuery(false);
          setGetAccountLoginInfoTransactionStatus(true);
        }
      };
      get_user_info();
    },  [runLoginQuery]);
  

    useEffect(() => {
      if (getAccountLoginInfoTransactionStatus) {
        if (records) {
          console.log('Records:', records);
          const transformed_records = recordsAsObjects(records);
          if (transformed_records.length === 0) {
            console.log("transformed_records.length === 0")
            toast.error('User with that email and password combination does not exist!');
          } else {
            console.log('Transformed Records:', transformed_records)
            const user = transformed_records[0];
            storeUserSession(user);
            setUserSession(user);
            toast.success('Login Successful!');
            resetLoginInfo();
          }
        } else if (loading) {
          console.log('Retrieving user session data...');
        } else if (error) {
          console.error('Error retrieving user session data:', error);
          toast.error(`Error: ${error.message}`);
          resetLoginInfo();
        } else {
          console.log('Something else happened');
        }
      }
    }, [loading, error, records, getAccountLoginInfoTransactionStatus]);

    
    const attempt_login = () => {
      console.log("attempt_login: ");
      setRunLoginQuery(true);
    };
    



    return (
      <>
        <ToastContainer/>
        <View style={[loginPageStyles.container, styles.appTheme]} TestID="LoginFullPageContainer">
          <View style={styles.authContainer} TestID="LoginComponentsContainer">
            <TextComponent style={styles.h1}>Login</TextComponent>
            <TextInputComponent
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
            />
            
            <TextInputComponent
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            <ButtonComponent
                title="Login"
                onPress={attempt_login}
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
