import { add, format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, CheckBox } from 'react-native';
import { toast } from 'react-toastify';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { CreateGameTimeSelectorComponent } from '../base_components/CreateGameTimeSelectorComponent';
import { SelectInterestsScrollView } from '../composite_components/SelectInterestsScrollview';

import { ModalComponent } from '../base_components/ModalComponent';
import {
  CREATE_ACCOUNT_INTEREST_RELATIONSHIPS,
  CREATE_EVENT,
  INVITE_FRIENDS_TO_EVENT,
} from '../db/queries';
import { useCustomCypherWrite } from '../hooks/CustomCypherHooks';

import { date_time_format } from '../utils/constants';
import { getAddressFromCoordinates } from '../utils/HelperFunctions';
import styles from '../styles';

export const CreateGameDateTimeModal = ({
  isVisible,
  onRequestClose,
  location,
  googleMapsApiKey,
  setIsCreateGameDateTimeModalVisible,
  setIsInviteFriendsToEventModalVisible,
  resetCreateGameDetails,
  setIsCreateGameMode,
  userSession,
  setEventUUID
}) => {
  const current_date = new Date().toISOString();
  const current_date_split = current_date.split('T');
  const [date_selected, setDateSelected] = useState(current_date_split[0]);
  const [time_selected, setTimeSelected] = useState(
    current_date_split[1].slice(0, 8)
  );

  const {
    transactionStatus: create_event_status,
    executeQuery: run_create_event,
    resetTransactionStatus: reset_create_event_transaction_status,
  } = useCustomCypherWrite(CREATE_EVENT);

  useEffect(() => {
    if (create_event_status.STATUS === 'ERROR') {
      toast.error(`Error Creating Event: ${create_event_status.RESPONSE}`);
      console.log(create_event_status.RESPONSE);
      setIsCreateGameMode(false);
    } else if (create_event_status.STATUS === 'SUCCESS') {
      console.log(
        'create_event_status.RESPONSE: ',
        create_event_status.RESPONSE
      );
      const event = create_event_status.RESPONSE.RECORDS[0];
      setEventUUID(event.UUID);
      toast.success('You Created an Event!');
      reset_create_event_transaction_status();
      resetCreateGameDetails();
      setIsInviteFriendsToEventModalVisible(true);
      setIsCreateGameMode(false);
    }
  }, [create_event_status]);

  const createEvent = async () => {
    const address = await getAddressFromCoordinates(
      location.lat,
      location.lng,
      googleMapsApiKey
    );
    const create_game_date_time = new Date(`${date_selected}T${time_selected}`);

    const params = {
      CreatedByID: userSession.UUID,
      Address: address,
      StartTimestamp: format(create_game_date_time, date_time_format),
      Host: userSession.Username,
      EventCreatedAt: format(new Date(), date_time_format),
      Lon: location.lng,
      PublicEventFlag: true,
      EndTimestamp: format(
        add(new Date(create_game_date_time), { hours: 1 }),
        date_time_format
      ),
      EventName: 'Pickup Basketball',
      Lat: location.lat,
    };
    console.log('Create Game params:', params);
    run_create_event(params);
  };

  const handleDateSelected = (date) => {
    console.log('Create Game panel selected date:', date);
    setDateSelected(date);
  };

  const handleTimeSelected = (time) => {
    const time_string = time.toISOString().split('T')[1].slice(0, 8);
    console.log('Parsed time string:', time_string);
    setTimeSelected(time_string);
  };

  const handleSubmitButtonClick = () => {
    createEvent();
    setIsCreateGameDateTimeModalVisible(false);
    setIsInviteFriendsToEventModalVisible(true);
  };

  return (
    <ModalComponent
      id="create-game-select-datetime-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Select Date & Time"
      menuButton={
        <ButtonComponent
          id="create-game-select-datetime-button"
          title="Set Date & Time"
          onPress={handleSubmitButtonClick}
          style={styles.buttons.menu_button_styles}
        />
      }
    >
      <View>
        <CalendarComponent
          id="create-game-date-selector"
          onDateSelected={handleDateSelected}
        />
        <CreateGameTimeSelectorComponent
          id="create-game-time-selector"
          onValueChange={handleTimeSelected}
        />
      </View>
    </ModalComponent>
  );
};

export const InviteFriendsToEventModal = ({
  isVisible,
  setIsInviteFriendsToEventModalVisible,
  friendList,
  eventUUID,
  setEventUUID,
  onRequestClose,
  userSession,
}) => {
  const {
    transactionStatus: invite_friends_status,
    executeQuery: run_invite_friends,
    resetTransactionStatus: reset_invite_friends_transaction_status,
  } = useCustomCypherWrite(INVITE_FRIENDS_TO_EVENT);

  useEffect(() => {
    if (invite_friends_status.STATUS === 'ERROR') {
      toast.error(
        `Error Sending Event Invites: ${invite_friends_status.RESPONSE}`
      );
      console.log(invite_friends_status.RESPONSE);
      reset_invite_friends_transaction_status();
      setIsInviteFriendsToEventModalVisible(false);
      setEventUUID(null);
    } else if (invite_friends_status.STATUS === 'SUCCESS') {
      toast.success('Event Invites Sent!');
      reset_invite_friends_transaction_status();
      setIsInviteFriendsToEventModalVisible(false);
      setEventUUID(null);
    }
  }, [invite_friends_status]);

  const initialFriends = friendList.map((friend) => {
    return {
      ...friend,
      isChecked: false,
    };
  });

  const [friends, setFriends] = React.useState(initialFriends);
  const [anyChecked, setAnyChecked] = React.useState(false);

  const handleValueChange = (index, newValue) => {
    const updatedFriends = friends.map((friend, i) => {
      if (i === index) {
        return { ...friend, isChecked: newValue };
      }
      return friend;
    });
    setFriends(updatedFriends);
    setAnyChecked(updatedFriends.some((friend) => friend.isChecked));
  };

  const handleSubmitButtonClick = () => {
    const selectedFriendUUIDs = friends
      .filter((friend) => friend.isChecked)
      .map((friend) => friend.friendUUID);
    console.log('Selected friends:', selectedFriendUUIDs);
    run_invite_friends({
      event_uuid: eventUUID,
      friend_invite_list: selectedFriendUUIDs,
      inviter_uuid: userSession.UUID,
    });
  };

  const FriendChecklistItem = ({ name, isChecked, onValueChange }) => {
    return (
      <View style={modalStyles.itemContainer}>
        <CheckBox value={isChecked} onValueChange={onValueChange} />
        <Text style={modalStyles.itemText}>{name}</Text>
      </View>
    );
  };

  return (
    <ModalComponent
      id="create-game-invite-friend-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Invite Friends"
      menuButton={
        <ButtonComponent
          id="create-game-invite-friends-button"
          title={
            anyChecked ? 'Send Invites & Create Game' : 'Skip & Create Game'
          }
          onPress={handleSubmitButtonClick}
          style={modalStyles.buttonStyle}
        />
      }
    >
      <ScrollView style={modalStyles.scrollView}>
        {friends.map((friend, index) => (
          <FriendChecklistItem
            key={friend.friendUUID}
            name={friend.friendUsername}
            isChecked={friend.isChecked}
            onValueChange={(newValue) => handleValueChange(index, newValue)}
          />
        ))}
      </ScrollView>
    </ModalComponent>
  );
};

export const SelectInterestsModal = ({
  isVisible,
  setSelectInterestsModalVisible,
  onRequestClose,
  accountUUID,
  onSubmitButtonClick,
}) => {

  const [event_types_selected, setEventTypesSelected] = useState([]);

  const {
    transactionStatus: create_account_interest_relationships_status,
    executeQuery: run_create_account_interest_relationships,
    resetTransactionStatus: reset_create_account_interest_relationships_transaction_status,
  } = useCustomCypherWrite(CREATE_ACCOUNT_INTEREST_RELATIONSHIPS);

  const handleSubmitButtonClick = () => {
    const selectedEventTypeUUIDs = event_types
      .filter((eventType) => eventType.isChecked)
      .map((eventType) => eventType.UUID);
    run_create_account_interest_relationships({
      account_uuid: accountUUID,
      event_type_uuid_list: selectedEventTypeUUIDs,
    });
  };

  useEffect(() => {
    if (create_account_interest_relationships_status.STATUS === 'ERROR') {
      toast.error(
        `Error Creating Interests: ${create_account_interest_relationships_status.RESPONSE}`
      );
      console.error(create_account_interest_relationships_status.RESPONSE);
      reset_create_account_interest_relationships_transaction_status();
    } else if (
      create_account_interest_relationships_status.STATUS === 'SUCCESS'
    ) {
      console.log(
        'Create Interests Response:',
        create_account_interest_relationships_status.RESPONSE
      );
      toast.success(`Interests Set Successfully!`);
      reset_create_account_interest_relationships_transaction_status();
      onSubmitButtonClick();
    }
  }, [create_account_interest_relationships_status]);


  return (
    <ModalComponent
      TestID="select-interests-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="What Type of Events Do You Like?"
      menuButton={
        <ButtonComponent
          id="select-interests-submit-button"
          title="Submit"
          onPress={handleSubmitButtonClick}
          style={modalStyles.buttonStyle}
        />
      }
    >
      <SelectInterestsScrollView setEventTypesSelected={setEventTypesSelected} />
    </ModalComponent>
  );
};

const modalStyles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: styles.appTheme.color,
  },
  buttonStyle: {
    marginBottom: 20,
    backgroundColor: '#2196F3',
  },
  scrollView: {
    marginLeft: 20,
    marginRight: 20,
  },
});
