import React, {useState} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Link } from 'react-router-native';
// import { send } from 'emailjs-com';



import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import styles from '../styles';

export function CreateAccountPage() {
  const [email, setEmail] = useState('');

  // const sendConfirmationEmail = async (email) => {
  //   // Replace this with your desired email sending method
  //   // For example, using emailjs
  //   try {
  //     const templateParams = {
  //       to_email: email,
  //       // Any other data you want to pass to the email template
  //     };
  //     const result = await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID');
  //     console.log('Email sent successfully:', result);
  //   } catch (error) {
  //     console.error('Failed to send email:', error);
  //   }
  // };


  return (
    <View style={[createAccountStyles.container, styles.appTheme]} TestID="CreateAccountFullPageContainer">
      <View style={styles.authContainer} TestID="CreateAccountComponentsContainer">
        <TextComponent style={styles.h1}>Create Account</TextComponent>
        {/* <Text style={styles.h3}>Email address</Text> */}
        <TextInputComponent
          keyboardType="email-address"
          placeholder="Enter Email" // Added placeholder
          onChangeText={text => setEmail(text)}
          value={email}

        />
        {/* <Text style={styles.h3}>Username</Text> */}
        <TextInputComponent placeholder="Enter Username" />
        {/* <Text style={styles.h3}>Password</Text> */}
        <TextInputComponent
          secureTextEntry={true}
          placeholder="Enter Password" // Added placeholder
        />
        
        {/* <Text style={styles.h3}>Re-Enter Password</Text> */}
        <TextInputComponent secureTextEntry={true} placeholder="Re-Enter Password" // Added placeholder
        />
        <ButtonComponent
          title="Create Account"
          // onPress={() => sendConfirmationEmail(email)}
          style={styles.buttons.menu_button_styles}
        />
        <View style={createAccountStyles.loginLinkContainer}>
          <TextComponent>Already have an account? </TextComponent>
          <Link to="/login">
            <TextComponent style={createAccountStyles.loginLink}>Login</TextComponent>
          </Link>
        </View>
      </View>
    </View>

  );
}
  

const createAccountStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16
  },
  loginLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});
