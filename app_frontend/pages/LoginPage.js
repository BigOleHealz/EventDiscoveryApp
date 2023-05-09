import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';


import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import styles from '../styles';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
      <View style={[loginPageStyles.container, styles.appTheme]} TestID="LoginFullPageContainer">
        <View style={styles.authContainer} TestID="LoginComponentsContainer">
          <TextComponent style={styles.h1}>Login</TextComponent>
          <TextInputComponent
            placeholder="Enter Email or Username"
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
              onPress={() => console.log('Login pressed')}
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

  
  
  