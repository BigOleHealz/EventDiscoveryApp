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

export function ForgotPassword() {
	const [email, setEmail] = useState('');

	const handleEmailChange = (newEmail) => {
		setEmail(newEmail);
	};

	const handleSubmit = () => {
		console.log("Email: " + email);
	};

	return (
		<>
			<View style={[forgotPasswordPageStyles.container, styles.appTheme]} TestID="ForgotPasswordFullPageContainer">
				<View style={styles.authContainer} TestID="LoginComponentsContainer">
					<TextComponent style={styles.h1}>Forgot Password</TextComponent>
					<TextInputComponent
						placeholder="Enter Email"
						value={email}
						onChangeText={handleEmailChange}
					/>
					<ButtonComponent
						title="Send Password Reset Email"
						onPress={handleSubmit}
						style={styles.buttons.menu_button_styles}
					/>
				</View>
			</View>
		</>
	);
};

const forgotPasswordPageStyles = StyleSheet.create({
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
});
