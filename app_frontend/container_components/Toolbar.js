import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, FlatList, ScrollView, Dimensions } from 'react-native';
import { useReadCypher, useWriteCypher } from 'use-neo4j';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { TopPanel } from './Panels';
import { ButtonComponent } from '../base_components/ButtonComponent';
import friendsIcon from '../assets/friends-icon.png';
import notificationsIcon from '../assets/notifications-icon.png';
import { recordsAsObjects } from '../db/DBHandler';
import { GET_FRIEND_REQUESTS, GET_EVENT_INVITES, RESPOND_TO_EVENT_INVITE } from '../db/queries';
import { getUserSession } from '../utils/SessionManager';
import styles from '../styles';


export const Toolbar = ({
  onLeftButtonClick,
  onRightButtonClick,
  isEventInvitesPanelVisible,
  onEventInvitesButtonClick,
  isFriendRequestsPanelVisible,
  onFriendRequestsButtonClick
}) => {

  const [toolbarHeight, setToolbarHeight] = useState(0);
	const maxTopPanelHeight = Dimensions.get('window').height * 0.8; // Adjust the 0.8 value according to your requirements

  const [userSession, setUserSession] = useState(null);
  const [friend_requests, setFriendRequests] = useState([]);
  const [event_invites, setEventInvites] = useState([]);

  const [runRespondToEventInviteQuery, setRunRespondToEventInviteQuery] = useState(false);
  const [event_invite_response, setEventInviteResponse] = useState(null);
  const [event_invite_uuid, setEventInviteUUID] = useState(null);
  const [eventInviteResponseTransactionStatus, setEventInviteResponseTransactionStatus] = useState(false);


  const {loading: loading_friend_requests, error: error_friend_requests, records: records_friend_requests, run: run_fetch_friend_requests} = useReadCypher(GET_FRIEND_REQUESTS);
  const {loading: loading_event_invites, error: error_event_invites, records: records_event_invites, run: run_fetch_event_invites} = useReadCypher(GET_EVENT_INVITES);
  const {loading: loading_event_invite_response, error: error_event_invite_response, records: records_event_invite_response, run: run_event_invite_response} = useWriteCypher(RESPOND_TO_EVENT_INVITE);

  const respondToEventInvite = (response, inviteUUID) => {
    console.log("respondToEventInvite: ", response, inviteUUID);
    setEventInviteResponse(response);
    setEventInviteUUID(inviteUUID);
    setRunRespondToEventInviteQuery(true);
  };


  



  useEffect(() => {
    const set_user_session = async () => {
      const session = await getUserSession();
      if (session) {
        setUserSession(session);
      }
    };
    set_user_session();
  }, []);
  
  useEffect(() => {
    const get_friend_requests = async () => {
      if (userSession && userSession.UUID) {
        const params = { UUID: userSession.UUID };
        run_fetch_friend_requests(params);
      }
    };

    const get_event_invites = async () => {
      if (userSession && userSession.UUID) {
        const params = { UUID: userSession.UUID };
        run_fetch_event_invites(params);
      }
    };
  
    get_friend_requests();
    get_event_invites();
  }, [userSession]);

  useEffect(() => {
    const response_to_event_invite = async () => {
      if (runRespondToEventInviteQuery) {
  
        const params = {
          RESPONSE: event_invite_response,
          UUID: event_invite_uuid
        };
        console.log('params', params);
        run_event_invite_response(params);

        setRunRespondToEventInviteQuery(false);
        setEventInviteResponseTransactionStatus(true);
      }
    };
    response_to_event_invite();
  },  [runRespondToEventInviteQuery]);


  
  useEffect(() => {
    if (!loading_friend_requests && !error_friend_requests && records_friend_requests) {
      const friendRequestObjectList = recordsAsObjects(records_friend_requests)
      setFriendRequests(friendRequestObjectList);
      console.log("Friend Requests: ", friendRequestObjectList);
    } else if (loading_friend_requests) {
      console.log("Loading Friend Requests...");
    } else if (error_friend_requests) {
      console.log("error: loading friend requests still loading");
    }
  }, [loading_friend_requests, error_friend_requests, records_friend_requests]);

  useEffect(() => {
    if (!loading_event_invites && !error_event_invites && records_event_invites) {
      const eventInvitestObjectList = recordsAsObjects(records_event_invites)
      setEventInvites(eventInvitestObjectList);
      console.log("Event Invites: ", eventInvitestObjectList);
    } else if (loading_event_invites) {
      console.log("Loading Event Invites...");
    } else if (error_event_invites) {
      console.log("error: ", error_event_invites);
    }
  }, [loading_event_invites, error_event_invites, records_event_invites]);

  useEffect(() => {
    if (loading_event_invite_response && eventInviteResponseTransactionStatus) {
        setEventInviteResponseTransactionStatus('loading');
    }  else if (records_event_invite_response && eventInviteResponseTransactionStatus) {
        setEventInviteResponseTransactionStatus('success');
        toast.success('Response Sent Successfully!');
        if (error_event_invite_response) {
          error_event_invite_response = null;
        }
        setEventInvites(event_invites => event_invites.filter(invite => invite.InviteRelationshipUUID !== event_invite_uuid));
        setEventInviteResponse(null);
        setEventInviteUUID(null);
        setEventInviteResponseTransactionStatus(false);
    } else if (error_event_invite_response && eventInviteResponseTransactionStatus) {
        setEventInviteResponseTransactionStatus('error');
        toast.error(`Error: ${error_event_invite_response.message}`);
        setEventInviteResponse(null);
        setEventInviteUUID(null);
        setEventInviteResponseTransactionStatus(false);
    }
  }, [loading_event_invite_response, error_event_invite_response, records_event_invite_response, eventInviteResponseTransactionStatus]);
  



  const renderListItem = ({ view, onAcceptButtonClick, onDeclineButtonClick }) => (
    <View style={toolbar_styles.listItem}>
      {view}
      <View style={toolbar_styles.acceptDeclineButtonView}>
        <ButtonComponent title="Accept" onPress={onAcceptButtonClick} style={[toolbar_styles.acceptDeclineButton, toolbar_styles.acceptButton]} />
        <ButtonComponent title="Decline" onPress={onDeclineButtonClick} style={[toolbar_styles.acceptDeclineButton, toolbar_styles.declineButton]} />
      </View>
    </View>
  );

  const eventInvitesView = (maxHeight) => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ maxHeight }}>
      <FlatList
        data={event_invites}
        renderItem={({ item }) => renderListItem({
          view: <table style={toolbar_styles.table}>
                  <tbody>
                    <tr>
                      <td style={toolbar_styles.label}>Address:</td>
                      <td style={toolbar_styles.value}>{item.Address}</td>
                    </tr>
                    <tr>
                      <td style={toolbar_styles.label}>Starts At:</td>
                      <td style={toolbar_styles.value}>{item.StartTimestamp}</td>
                    </tr>
                    <tr>
                      <td style={toolbar_styles.label}>Players:</td>
                      <td style={toolbar_styles.value}>{item.AttendeeCount.toNumber()}</td>
                    </tr>
                  </tbody>
                </table>,
              onAcceptButtonClick: () => respondToEventInvite('ACCEPTED', item.InviteRelationshipUUID),
              onDeclineButtonClick: () => respondToEventInvite('DECLINED', item.InviteRelationshipUUID)

        })}
  
        keyExtractor={(item) => item.InviteRelationshipUUID}
        contentContainerStyle={{ padding: 10 }}
      />
    </ScrollView>
  );


  
  const friendRequestView = (maxHeight) => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ maxHeight }}>
      <FlatList
        data={friend_requests}
        renderItem={({ item }) => renderListItem({
          view: <Text style={toolbar_styles.listItemText}>{item.Username}</Text>,
          onAcceptButtonClick: () => {
            run_accept_event_invite({ InviteRelationshipUUID: item.InviteRelationshipUUID });
          },
          onDeclineButtonClick: () => {
            run_decline_event_invite({ InviteRelationshipUUID: item.InviteRelationshipUUID });
          }
  
        })}
  
        keyExtractor={(item) => item.RequesterUUID}
        contentContainerStyle={{ padding: 10 }}
      />
    </ScrollView>
  );

  
  return (
    <>
      <TopPanel
        position={["0px", `${toolbarHeight}px`]}
        title="Event Invites"
        isVisible={isEventInvitesPanelVisible}
        children={eventInvitesView(maxTopPanelHeight)}
      />
      <TopPanel
        position={["0px", `${toolbarHeight}px`]}
        title="Friends"
        isVisible={isFriendRequestsPanelVisible}
        children={friendRequestView(maxTopPanelHeight)}
      />
      <View
        testID="toolbar"
        style={toolbar_styles.toolbar}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setToolbarHeight(height);
        }}
      >
        <ButtonComponent title="Find Games" onPress={onLeftButtonClick} style={toolbar_styles.toolbarButtonLeft} />
        <View style={toolbar_styles.centerView}>
          <View style={toolbar_styles.centeredButtonsContainer}>
            <ButtonComponent icon={notificationsIcon} onPress={onEventInvitesButtonClick} style={toolbar_styles.centerButton} />
            <ButtonComponent icon={friendsIcon} onPress={onFriendRequestsButtonClick} style={toolbar_styles.centerButton} />
          </View>
        </View>
        <ButtonComponent title="Create Game" onPress={onRightButtonClick} style={toolbar_styles.toolbarButtonRight} />
      </View>
    </>
  );
};

const toolbar_styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: styles.appTheme.backgroundColor,
    padding: 15,
  },
  toolbarComponent: {
    height: '100%',
  },
  toolbarButtonLeft: {
    paddingLeft: 10,
  },
  toolbarButtonRight: {
    paddingRight: 10,
  },
  toolbarButtonText: {
    color: styles.appTheme.color,
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerView: {
    flex: 1,
    alignItems: 'center',
  },
  centeredButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerButton: {
    paddingHorizontal: 10,
  },
  icon: {
    height: 35,
    width: 35
    // resizeMode: 'contain',
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
	acceptDeclineButtonView: {
		flexDirection: 'row',
		// alignSelf: 'flex-end',
    justifyContent: 'space-between',
    alignItems: 'center', // Add this line to vertically center the buttons
    height: '100%', // Make sure the height is 100% to take the full height of listItem

    
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
	separator: {
		height: 5, // You can adjust the separator height as needed
		width: '100%',
		backgroundColor: '#eeeeee', // You can change the separator color as needed
	},
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    width: '100%',
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
});
