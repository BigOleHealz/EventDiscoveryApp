import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, FlatList, ScrollView, Dimensions } from 'react-native';
import { useReadCypher } from 'use-neo4j';

import { TopPanel } from './Panels';
import { ButtonComponent } from '../base_components/ButtonComponent';
import friendsIcon from '../assets/friends-icon.png';
import notificationsIcon from '../assets/notifications-icon.png';
import { recordsAsObjects } from '../db/DBHandler';
import { GET_FRIEND_REQUESTS, GET_EVENT_INVITES, ACCEPT_EVENT_INVITE, DECLINE_EVENT_INVITE } from '../db/queries';
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

  const {loading: loading_friend_requests, error: error_friend_requests, records: records_friend_requests, run: run_fetch_friend_requests} = useReadCypher(GET_FRIEND_REQUESTS);
  const {loading: loading_event_invites, error: error_event_invites, records: records_event_invites, run: run_fetch_event_invites} = useReadCypher(GET_EVENT_INVITES);


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
    if (!loading_friend_requests && !error_friend_requests && records_friend_requests) {
      const friendRequestObjectList = recordsAsObjects(records_friend_requests)
      setFriendRequests(friendRequestObjectList);
      console.log("Friend Requests: ", friendRequestObjectList);
    } else if (loading_friend_requests) {
      console.log("Loading...");
    } else if (error_friend_requests) {
      console.log("error: ", error_friend_requests);
    }
  }, [loading_friend_requests, error_friend_requests, records_friend_requests]);

  useEffect(() => {
    if (!loading_event_invites && !error_event_invites && records_event_invites) {
      const eventInvitestObjectList = recordsAsObjects(records_event_invites)
      setEventInvites(eventInvitestObjectList);
      console.log("Event Invites: ", eventInvitestObjectList);
    } else if (loading_event_invites) {
      console.log("Loading...");
    } else if (error_event_invites) {
      console.log("error: ", error_event_invites);
    }
  }, [loading_event_invites, error_event_invites, records_event_invites]);


  const dummyNotificationList = (
    <View style={{ padding: 10 }}>
      {Array.from({ length: 10 }).map((_, index) => (
        <View
          key={`dummy-item-${index}`}
          style={{
            backgroundColor: 'lightgray',
            borderRadius: 5,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 16 }}>{`Dummy Item ${index + 1}`}</Text>
        </View>
      ))}
    </View>
  );


  const renderListItem = ({ view, onAcceptButtonClick, onDeclineButtonClick }) => (
    <View style={toolbar_styles.listItem}>
      {view}
      <View style={toolbar_styles.acceptDeclineButtonView}>
        <ButtonComponent title="Accept" onPress={onAcceptButtonClick} style={[toolbar_styles.acceptDeclineButton, toolbar_styles.acceptButton]} />
        <ButtonComponent title="Decline" onPress={onDeclineButtonClick} style={[toolbar_styles.acceptDeclineButton, toolbar_styles.declineButton]} />
      </View>
    </View>
  );
  

  
  const friendRequestView = (maxHeight) => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ maxHeight }}>
      <FlatList
        data={friend_requests}
        renderItem={({ item }) => renderListItem({
          view: <Text style={toolbar_styles.listItemText}>{item.Username}</Text>,
          onAcceptButtonClick: () => console.log('Accepted Request:', item.RequesterUUID),
          onDeclineButtonClick: () => console.log('Declined Request:', item.RequesterUUID)
        })}
  
        keyExtractor={(item) => item.RequesterUUID}
        contentContainerStyle={{ padding: 10 }}
      />
    </ScrollView>
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
          onAcceptButtonClick: () => console.log('Accepted Invite:', item.InviteRelationshipUUID),
          onDeclineButtonClick: () => console.log('Declined Invite:', item.InviteRelationshipUUID)
        })}
  
        keyExtractor={(item) => item.InviteRelationshipUUID}
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
