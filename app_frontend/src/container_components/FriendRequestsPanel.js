import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { toast } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { TopPanel } from '../composite_components/TopPanels';
import { CREATE_FRIEND_REQUEST_RELATIONSHIP, GET_FRIEND_REQUESTS, RESPOND_TO_FRIEND_REQUEST } from '../db/queries';
import { useCustomCypherRead, useCustomCypherWrite } from '../hooks/CustomCypherHooks';
import { UserSessionContext } from '../utils/Contexts';
import styles from '../styles.js'

export const FriendRequestsPanel = ({
	isVisible,
	toolbarHeight,
}) => {

	const maxTopPanelHeight = Dimensions.get('window').height * 0.8;
	const { userSession, setUserSession } = React.useContext(UserSessionContext);

	//////////////////////////////////////////////////////////////////////////////////////////
	// Load Friend Requests Logic
	//////////////////////////////////////////////////////////////////////////////////////////
	const [friend_requests, setFriendRequests] = useState([]);

	const {
		transactionStatus: fetch_friend_requests_status,
		executeQuery: run_fetch_friend_requests,
		resetTransactionStatus: reset_fetch_friend_requests_transaction_status
	} = useCustomCypherRead(GET_FRIEND_REQUESTS);


	useEffect(() => {
		run_fetch_friend_requests({ invitee_uuid: userSession.UUID });
	}, []);

	useEffect(() => {
		if (fetch_friend_requests_status.STATUS === 'ERROR') {
			toast.error(`Error Fetching Friend Requests: ${fetch_friend_requests_status.RESPONSE}`);
			console.log(`Error Fetching Friend Requests: ${fetch_friend_requests_status.RESPONSE}`);
			reset_fetch_friend_requests_transaction_status();
		} else if (fetch_friend_requests_status.STATUS === 'SUCCESS') {
			setFriendRequests(fetch_friend_requests_status.RESPONSE.RECORDS)
			reset_fetch_friend_requests_transaction_status();
		}
	}, [fetch_friend_requests_status]);

	// //////////////////////////////////////////////////////////////////////////////////////////
	// // Respond to Friend Request Logic
	// //////////////////////////////////////////////////////////////////////////////////////////
	const {
		transactionStatus: respond_to_friend_request_status,
		executeQuery: run_respond_to_friend_request,
		resetTransactionStatus: reset_respond_to_friend_request_transaction_status
	} = useCustomCypherWrite(RESPOND_TO_FRIEND_REQUEST);


	const respondToFriendRequest = (response, requestUUID) => {
		run_respond_to_friend_request({
			response: response,
			friend_request_uuid: requestUUID
		})
	};

	useEffect(() => {
		if (respond_to_friend_request_status.STATUS === 'ERROR') {
			toast.error(`Error Responding to Friend Request: ${respond_to_friend_request_status.RESPONSE}`);
			console.log(`Error Responding to Friend Request: ${respond_to_friend_request_status.RESPONSE}`);
			reset_respond_to_friend_request_transaction_status();
		} else if (respond_to_friend_request_status.STATUS === 'SUCCESS') {
			toast.success(`Response Sent Successfully!`);
			const friend_request_uuid = respond_to_friend_request_status.RESPONSE.RECORDS[0].FRIEND_REQUEST_UUID
			setFriendRequests(friend_requests => friend_requests.filter(invite => invite.InviteRelationshipUUID !== friend_request_uuid))
			reset_respond_to_friend_request_transaction_status();
		}
	}, [respond_to_friend_request_status]);


	// //////////////////////////////////////////////////////////////////////////////////////////
	// Send Friend Request Logic
	// //////////////////////////////////////////////////////////////////////////////////////////
	const [friend_request_email, setFriendRequestEmail] = useState('');

	const {
		transactionStatus: send_friend_request_status,
		executeQuery: run_send_friend_request,
		resetTransactionStatus: reset_send_friend_request_transaction_status
	} = useCustomCypherWrite(CREATE_FRIEND_REQUEST_RELATIONSHIP);

	useEffect(() => {
		if (send_friend_request_status.STATUS === 'ERROR') {
			toast.error(`Error Sending Friend Request: ${send_friend_request_status.RESPONSE}`);
			console.log(`Error Sending Friend Request: ${send_friend_request_status.RESPONSE}`);
			reset_send_friend_request_transaction_status();
		} else if (send_friend_request_status.STATUS === 'SUCCESS') {
			toast.success("Friend Request Sent!");
			reset_send_friend_request_transaction_status();
			setFriendRequestEmail('');
		}
	}, [send_friend_request_status]);

	const handleFriendRequestEmailChange = (newEmail) => {
		setFriendRequestEmail(newEmail);
	};

	const handleSendFriendRequestSubmit = () => {
		run_send_friend_request({
			sender_email: userSession.Email,
			recipient_email: friend_request_email
		})
	};

	//////////////////////////////////////////////////////////////////////////////////////////
	// Render Panel Content Logic
	//////////////////////////////////////////////////////////////////////////////////////////
	const renderListItem = ({ view, onAcceptButtonClick, onDeclineButtonClick }) => (
		<View style={friend_requests_panel.listItem}>
			{view}
			<View style={friend_requests_panel.acceptDeclineButtonView}>
				<ButtonComponent title="Accept" onPress={onAcceptButtonClick} style={[friend_requests_panel.acceptDeclineButton, friend_requests_panel.acceptButton]} />
				<ButtonComponent title="Decline" onPress={onDeclineButtonClick} style={[friend_requests_panel.acceptDeclineButton, friend_requests_panel.declineButton]} />
			</View>
		</View>
	);

	return (
		<TopPanel
			isVisible={isVisible}
			toolbarHeight={toolbarHeight}
			title="Friend Requests"
		>
			<View style={friend_requests_panel.sendFriendRequestView}>
				<TextInputComponent
					testid="text-input-send-friend-request"
					placeholder="Enter Email to Send Friend Request"
					value={friend_request_email}
					onChangeText={handleFriendRequestEmailChange}
					style={friend_requests_panel.sendFriendRequestTextInput}
				/>
				<ButtonComponent
					testid="button-send-friend-request"
					title="Send Friend Request"
					onPress={handleSendFriendRequestSubmit}
					style={friend_requests_panel.sendFriendRequestButton}
				/>
			</View>
			{friend_requests.length > 0 && (
				<>
					<View style={friend_requests_panel.divider} />
					<ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ maxHeight }}>
						<FlatList
							data={friend_requests}
							renderItem={({ item }) => renderListItem({
								view: <Text style={friend_requests_panel.listItemText}>{item.Username}</Text>,
								onAcceptButtonClick: () => respondToFriendRequest('ACCEPTED', item.FriendRequestUUID),
								onDeclineButtonClick: () => respondToFriendRequest('DECLINED', item.FriendRequestUUID),
							})}
							keyExtractor={(item) => item.FriendRequestUUID}
							contentContainerStyle={{ padding: 10 }}
						/>
					</ScrollView>
				</>
			)}
		</TopPanel>
	);
};


const friend_requests_panel = StyleSheet.create({
	acceptDeclineButtonView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
	},
	acceptDeclineButton: {
		marginHorizontal: 5,
	},
	acceptButton: {
		backgroundColor: 'green',
	},
	declineButton: {
		backgroundColor: 'red',
	},
	listItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'lightgray',
		borderRadius: 5,
		padding: 10,
		margin: 3,
	},
	listItemText: {
		fontSize: 16,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	sendFriendRequestView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingTop: 10,
		paddingLeft: 10,
		paddingRight: 10,
	},
	sendFriendRequestTextInput: {
		flex: 1,
		width: '70%',
		margin: 8,
	},
	sendFriendRequestButton: {
		margin: 8,
		backgroundColor: styles.buttons.menu_button_styles.backgroundColor
	},
	divider: {
		height: 2,
		backgroundColor: 'grey',
		marginVertical: 10,
	},
});
