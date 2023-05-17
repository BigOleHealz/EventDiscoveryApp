import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Link, useNavigate } from 'react-router-native';
import { ToastContainer, toast } from 'react-toastify';


import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { SelectInterestsModal } from '../container_components/Modals';
import { CREATE_PERSON_NODE } from '../db/queries';
import { useCustomCypherWrite } from '../hooks/CustomCypherHooks';
import { hashPassword } from '../utils/HelperFunctions'
import styles from '../styles';
import { is } from 'date-fns/locale';

export function CreateAccountPage({ awsHandler }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [selectInterestsModalVisible, setSelectInterestsModalVisible] = useState(true);
  const [accountCreatedUUID, setAccountCreatedUUID] = useState(null);

  const navigate = useNavigate();


  const {
    transactionStatus: create_account_status,
    executeQuery: run_create_account,
    resetTransactionStatus: reset_create_account_transaction_status
  } = useCustomCypherWrite(CREATE_PERSON_NODE);


  const resetCreateAccountInfo = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setUserName('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleFirstNameChange = (newFirstName) => {
    setFirstName(newFirstName);
  };

  const handleLastNameChange = (newLastName) => {
    setLastName(newLastName);
  };

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
  };

  const handleUsernameChange = (newUserName) => {
    setUserName(newUserName);
  };

  const handlePasswordChange = (newPassword) => {
    setPassword(newPassword);
  };

  const handleConfirmPasswordChange = (newConfirmPassword) => {
    setConfirmPassword(newConfirmPassword);
  };

  const handleSubmit = () => {
    // Check if all fields are filled
    if (!firstName || !lastName || !email || !userName || !password || !confirmPassword) {
      toast.error('All fields must be filled!');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    const hashed_password = hashPassword(password);
    run_create_account(
      {
        first_name: firstName,
        last_name: lastName,
        user_name: userName,
        email: email,
        hashed_password: hashed_password
      }
    );
  };

  useEffect(() => {
    if (create_account_status.STATUS === 'ERROR') {
      toast.error(`Error Creating Account: ${create_account_status.RESPONSE}`);
      console.log(create_account_status.RESPONSE);
    } else if (create_account_status.STATUS === 'SUCCESS') {
      setAccountCreatedUUID(create_account_status.RESPONSE.RECORDS[0].UUID);

      toast.success('Account Created Successfully!');
      resetCreateAccountInfo();
      reset_create_account_transaction_status();
      setSelectInterestsModalVisible(true);
    }
  }, [create_account_status]);

  const handleSelectInterestsModalSubmit = () => {
    setSelectInterestsModalVisible(false);
    navigate('/login');
  }


  return (
    <>
      <ToastContainer />
      <View style={[createAccountStyles.container, styles.appTheme]} TestID="CreateAccountFullPageContainer">
        <View style={styles.authContainer} TestID="CreateAccountComponentsContainer">
          <TextComponent style={styles.h1}>Create Account</TextComponent>

          <TextInputComponent
            placeholder="Enter First Name" // Added placeholder
            onChangeText={handleFirstNameChange}
            value={firstName}
          />
          <TextInputComponent
            placeholder="Enter LastName" // Added placeholder
            onChangeText={handleLastNameChange}
            value={lastName}
          />
          <TextInputComponent
            keyboardType="email-address"
            placeholder="Enter Email" // Added placeholder
            onChangeText={handleEmailChange}
            value={email}
          />
          <TextInputComponent
            placeholder="Enter Username"
            onChangeText={handleUsernameChange}
            value={userName}
          />
          <TextInputComponent
            secureTextEntry={true}
            placeholder="Enter Password" // Added placeholder
            onChangeText={handlePasswordChange}
            value={password}
          />
          <TextInputComponent
            secureTextEntry={true}
            placeholder="Re-Enter Password"
            onChangeText={handleConfirmPasswordChange}
            value={confirmPassword}
          />
          <ButtonComponent
            title="Create Account"
            onPress={handleSubmit}
            style={styles.buttons.menu_button_styles}
          />
          <View style={createAccountStyles.loginLinkContainer}>
            <TextComponent>Already have an account? </TextComponent>
            <Link to="/login">
              <TextComponent style={createAccountStyles.loginLink}>Login</TextComponent>
            </Link>
          </View>
        </View>
        {accountCreatedUUID &&
          <SelectInterestsModal
            isVisible={selectInterestsModalVisible}
            onRequestClose={() => setSelectInterestsModalVisible(false)}
            setSelectInterestsModalVisible={setSelectInterestsModalVisible}
            accountUUID={accountCreatedUUID}
            onSubmitButtonClick={handleSelectInterestsModalSubmit}
          />
        }
      </View>
    </>
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