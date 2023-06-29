import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { toast } from 'react-toastify';
import moment from 'moment';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { TopPanel } from '../composite_components/TopPanels';
import { GET_EVENT_INVITES, RESPOND_TO_EVENT_INVITE } from '../db/queries';
import { useCustomCypherRead, useCustomCypherWrite } from '../hooks/CustomCypherHooks';
import styles from '../styles';

export const EventInvitesPanel = ({ isVisible, toolbarHeight, userSession }) => {

	const maxTopPanelHeight = Dimensions.get('window').height * 0.8;

	//////////////////////////////////////////////////////////////////////////////////////////
	// Load Event Invites Logic
	//////////////////////////////////////////////////////////////////////////////////////////
	const [event_invites, setEventInvites] = useState([]);

	const {
		transactionStatus: fetch_event_invites_status,
		executeQuery: run_fetch_event_invites,
		resetTransactionStatus: reset_fetch_event_invites_transaction_status
	} = useCustomCypherRead(GET_EVENT_INVITES);


	useEffect(() => {
		run_fetch_event_invites({ invitee_uuid: userSession.UUID });
	}, []);

	useEffect(() => {
		if (fetch_event_invites_status.STATUS === 'ERROR') {
			toast.error(`Error Fetching Event Invites: ${fetch_event_invites_status.RESPONSE}`);
			console.log(`Error Fetching Event Invites: ${fetch_event_invites_status.RESPONSE}`);
			reset_fetch_event_invites_transaction_status();
		} else if (fetch_event_invites_status.STATUS === 'SUCCESS') {
			setEventInvites(fetch_event_invites_status.RESPONSE.RECORDS)
			reset_fetch_event_invites_transaction_status();
		}
	}, [fetch_event_invites_status]);

	//////////////////////////////////////////////////////////////////////////////////////////
	// Respond to Event Invite Logic
	//////////////////////////////////////////////////////////////////////////////////////////
	const {
		transactionStatus: respond_to_event_invite_status,
		executeQuery: run_respond_to_event_invite,
		resetTransactionStatus: reset_respond_to_event_invite_transaction_status
	} = useCustomCypherWrite(RESPOND_TO_EVENT_INVITE);

	const respondToEventInvite = (response, inviteUUID) => {
		console.log("respondToEventInvite: ", response, inviteUUID);
		run_respond_to_event_invite(
			{
				event_invite_uuid: inviteUUID,
				response: response
			}
		);
	};

	useEffect(() => {
		if (respond_to_event_invite_status.STATUS === 'ERROR') {
			toast.error(`Error Responding to Event Invite: ${respond_to_event_invite_status.RESPONSE}`);
			console.log(`Error Responding to Event Invite: ${respond_to_event_invite_status.RESPONSE}`);
			reset_respond_to_event_invite_transaction_status();
		} else if (respond_to_event_invite_status.STATUS === 'SUCCESS') {
			toast.success(`Response Sent Successfully!`);
			const event_invite_uuid = respond_to_event_invite_status.RESPONSE.RECORDS[0].EVENT_INVITE_UUID
			setEventInvites(event_invites => event_invites.filter(invite => invite.InviteRelationshipUUID !== event_invite_uuid))
			reset_respond_to_event_invite_transaction_status();
		}
	}, [respond_to_event_invite_status]);


	//////////////////////////////////////////////////////////////////////////////////////////
	// Render Panel Content Logic
	//////////////////////////////////////////////////////////////////////////////////////////
	const renderListItem = ({ view, onAcceptButtonClick, onDeclineButtonClick }) => (
		<View style={event_invites_panel.listItem}>
			{view}
			<View style={event_invites_panel.acceptDeclineButtonView}>
				<ButtonComponent title="Accept" onPress={onAcceptButtonClick} style={[event_invites_panel.acceptDeclineButton, event_invites_panel.acceptButton]} />
				<ButtonComponent title="Decline" onPress={onDeclineButtonClick} style={[event_invites_panel.acceptDeclineButton, event_invites_panel.declineButton]} />
			</View>
		</View>
	);

	return (
		<TopPanel
			isVisible={isVisible}
			toolbarHeight={toolbarHeight}
			title="Event Invites"
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ maxHeight: maxTopPanelHeight }}>
				<FlatList
					data={event_invites}
					renderItem={({ item }) => renderListItem({
						view: <table style={event_invites_panel.table}>
							<tbody>
								<tr>
									<td style={event_invites_panel.label}>Title:</td>
									<td style={event_invites_panel.value}>{item.EventName}</td>
								</tr>
								<tr>
									<td style={event_invites_panel.label}>Address:</td>
									<td style={event_invites_panel.value}>{item.Address}</td>
								</tr>
								<tr>
									<td style={event_invites_panel.label}>Starts At:</td>
									<td style={event_invites_panel.value}>{moment(convertUTCDateToLocalDate(item.StartTimestamp)).format('hh:mm a')}</td>
								</tr>
								<tr>
									<td style={event_invites_panel.label}>Ends At:</td>
									<td style={event_invites_panel.value}>{moment(convertUTCDateToLocalDate(item.EndTimestamp)).format('hh:mm a')}</td>
								</tr>
								<tr>
									<td style={event_invites_panel.label}>Event Type:</td>
									<td style={event_invites_panel.value}>{item.EventType}</td>
								</tr>
								{item.EventURL && (
								<tr>
									<td style={event_invites_panel.label}>Event URL:</td>
									<td style={event_invites_panel.value}>
									<a href={item.EventURL} target="_blank" rel="noopener noreferrer" style={styles.hyperlinkText}>
										{item.EventURL}
									</a>
									</td>
								</tr>
								)}
							</tbody>
						</table>,
						onAcceptButtonClick: () => respondToEventInvite('ACCEPTED', item.InviteRelationshipUUID),
						onDeclineButtonClick: () => respondToEventInvite('DECLINED', item.InviteRelationshipUUID)
					})}
					keyExtractor={(item) => item.InviteRelationshipUUID}
					contentContainerStyle={{ padding: 10 }}
				/>
			</ScrollView>
		</TopPanel>
	);
};


const event_invites_panel = StyleSheet.create({
	table: {
		margin: 10,
		borderCollapse: 'collapse',
		width: '100%',
	},
	acceptDeclineButtonView: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
	},
	acceptDeclineButton: {
		margin: 5,
	},
	acceptButton: {
		backgroundColor: 'green',
	},
	declineButton: {
		backgroundColor: 'red',
	},
	label: {
		width: '20%',
		fontWeight: '600',
		marginRight: '4px',
		paddingTop: 2,
		paddingRight: 10,
		paddingBottom: 2,
		paddingLeft: 0,
		textAlign: 'right',
	},
	value: {
		paddingTop: 2,
		paddingRight: 0,
		paddingBottom: 2,
		paddingLeft: 0,
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
});
