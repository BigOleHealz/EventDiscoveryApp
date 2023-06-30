import { format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, CheckBox, Switch } from 'react-native';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { SelectInterestsScrollView } from '../composite_components/SelectInterestsScrollview';

import { ModalComponent } from '../base_components/ModalComponent';
import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { UserSessionContext } from '../utils/Contexts';

import {
  CREATE_ACCOUNT_INTEREST_RELATIONSHIPS,
  CREATE_EVENT,
  INVITE_FRIENDS_TO_EVENT,
} from '../db/queries';
import { useCustomCypherWrite } from '../hooks/CustomCypherHooks';

import { CreateGameContext } from '../utils/Contexts';
import styles from '../styles';

export const CreateGameDateTimeModal = ({
  isVisible,
  onRequestClose,
  setIsCreateGameDateTimeModalVisible,
  setIsSelectEventTypeModalVisible,
}) => {
	const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { createGameData, setCreateGameData } = React.useContext(CreateGameContext);

  const currentDateInZonedTime = utcToZonedTime(new Date(), userSession.TimeZone);

  const [ date_selected, setDateSelected ] = useState(format(currentDateInZonedTime, day_format));
  const [ create_game_start_time, setCreateGameStartTime ] = useState(day_start_time);
  const [ create_game_end_time, setCreateGameEndTime ] = useState(day_end_time);

  const handleDateSelected = (date) => {
    setDateSelected(date);
  };

  const handleSubmitButtonClick = () => {
    const StartTimestampInUtc = zonedTimeToUtc(`${date_selected}T${create_game_start_time}`, userSession.TimeZone).toISOString().split('.')[0];
    const EndTimestampInUtc = zonedTimeToUtc(`${date_selected}T${create_game_end_time}`, userSession.TimeZone).toISOString().split('.')[0];

    setCreateGameData({
      ...createGameData,
      StartTimestamp: StartTimestampInUtc,
      EndTimestamp: EndTimestampInUtc
    });
    setIsCreateGameDateTimeModalVisible(false);
    setIsSelectEventTypeModalVisible(true);
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
        <TimeRangeSliderComponent
          startTime={create_game_start_time}
          setStartTime={setCreateGameStartTime}
          endTime={create_game_end_time}
          setEndTime={setCreateGameEndTime}
        />
      </View>
    </ModalComponent>
  );
};

export const SelectEventTypeModal = ({
  isVisible,
  setIsSelectEventTypeModalVisible,
  setIsInviteFriendsToEventModalVisible,
  onRequestClose,
}) => {
  const { createGameData, setCreateGameData } = React.useContext(CreateGameContext);
  const [event_type, setEventType] = useState(null);

  console.log('Create Game Data:', createGameData)

  const handleSubmitButtonClick = () => {
    if (!event_type) {
      toast.error('Please select an event type.');
      return;
    } else {
      setCreateGameData({
        ...createGameData,
        ...event_type
      });
      setIsSelectEventTypeModalVisible(false);
      setIsInviteFriendsToEventModalVisible(true);
    }
  };

  return (
    <ModalComponent
      id="create-game-select-event-type-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="What Type of Event is This?"
      menuButton={
        <ButtonComponent
          id="create-game-select-event-type-button"
          title="Select Event Type"
          onPress={handleSubmitButtonClick}
          style={styles.buttons.menu_button_styles}
        />
      }
    >
      <SelectInterestsScrollView
        setEventTypesSelected={setEventType}
        singleSelect={true}
      />
    </ModalComponent>
  );
};

export const InviteFriendsToEventModal = ({
  isVisible,
  setIsInviteFriendsToEventModalVisible,
  setIsCreateEventDetailsModalVisible,
  onRequestClose,
  isCreateGameMode,
  event_uuid
}) => {
	const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { createGameData, setCreateGameData } = React.useContext(CreateGameContext);

  const initialFriends = userSession.Friends.map((friend) => {
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

  const {
		transactionStatus: invite_friends_to_event_status,
		executeQuery: run_invite_friends_to_event,
		resetTransactionStatus: reset_invite_friends_to_event_transaction_status
	} = useCustomCypherWrite(INVITE_FRIENDS_TO_EVENT);

  const invite_friends_to_event = (invite_uuid_list) => {
		console.log("Creating Event: ", invite_uuid_list);
		run_invite_friends_to_event(invite_uuid_list);
	};

  useEffect(() => {
		if (invite_friends_to_event_status.STATUS === 'ERROR') {
      const error_message = `Error Sending Event Invites: ${invite_friends_to_event_status.RESPONSE}`;
			toast.error(error_message);
			console.log(error_message);
			reset_invite_friends_to_event_transaction_status();
		} else if (invite_friends_to_event_status.STATUS === 'SUCCESS') {
			toast.success(`Event Invites Sent Successfully!`);
			reset_invite_friends_to_event_transaction_status();
		}
	}, [invite_friends_to_event_status]);

  const handleSubmitButtonClick = () => {
    const selectedFriendUUIDs = friends
      .filter((friend) => friend.isChecked)
      .map((friend) => friend.friendUUID);
    console.log('Selected friends:', selectedFriendUUIDs);

    if (isCreateGameMode) {
      setCreateGameData({
        ...createGameData,
        InvitedFriends: selectedFriendUUIDs
      });
      setIsInviteFriendsToEventModalVisible(false);
      setIsCreateEventDetailsModalVisible(true);
    } else if (!event_uuid) {
      const error_message = `Error: No Event UUID`;
      toast.error(error_message);
      console.log(error_message);
      setIsInviteFriendsToEventModalVisible(false);
    } else {
      invite_friends_to_event({
        "event_uuid" : event_uuid,
        "inviter_uuid" : userSession.UUID,
        "friend_invite_list" : selectedFriendUUIDs,
      });
      setIsInviteFriendsToEventModalVisible(false);
    }
  }

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
          style={styles.buttons.menu_button_styles}
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

export const CreateEventDetailsModal = ({
  isVisible,
  onRequestClose,
}) => {
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { createGameData, setCreateGameData } = React.useContext(CreateGameContext);

  const [ event_name, setEventName ] = useState('');
  const [ event_description, setEventDescription ] = useState('');
  const [ public_event_flag, setPublicEventFlag ] = useState(false);

  const handleEventNameChange = (text) => {
    setEventName(text);
  };
  const handleEventDescriptionChange = (text) => {
    setEventDescription(text);
  };
  const handlePublicEventFlagChange = (value) => {
    console.log('Public Event Flag:', value);
    setPublicEventFlag(!public_event_flag);
  };

	const {
		transactionStatus: create_event_status,
		executeQuery: run_create_event,
		resetTransactionStatus: reset_create_event_transaction_status
	} = useCustomCypherWrite(CREATE_EVENT);

  const create_event = (event_data) => {
		console.log("Creating Event: ", event_data);
		run_create_event(event_data);
	};

  useEffect(() => {
		if (create_event_status.STATUS === 'ERROR') {
      const error_message = `Error Creating Event: ${create_event_status.RESPONSE}`;
			toast.error(error_message);
			console.log(error_message);
			reset_create_event_transaction_status();
		} else if (create_event_status.STATUS === 'SUCCESS') {
			toast.success(`Event Created Successfully!`);
			reset_create_event_transaction_status();
		}
	}, [create_event_status]);


  const handleSubmitButtonClick = () => {
    if (event_name === '') {
      toast.error('Please Input a Name for This Event');
      return;
    } else {
      const newCreateGameData = {
        ...createGameData,
        EventName: event_name,
        EventDescription: event_description,
        PublicEventFlag: public_event_flag,
        CreatedByUUID: userSession.UUID,
        Host: userSession.Username,
        UUID: uuidv4(),
      };
      console.log('Create Game Data:', newCreateGameData)
      setCreateGameData(newCreateGameData);
      create_event(newCreateGameData)
      onRequestClose();
    }
  };

  return (
    <ModalComponent
      id="create-game-event-details-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Fill Out Event Details"
      menuButton={
        <ButtonComponent
          id="create-game-event-details-button"
          title="Create Event"
          onPress={handleSubmitButtonClick}
          style={styles.buttons.menu_button_styles}
        />
      }
    >
      <View>
        <TextInputComponent
          id="create-game-event-name"
          placeholder="Event Name"
          value={event_name}
          onChangeText={handleEventNameChange}
          style={modalStyles.componentStyle}
        />
        <TextInputComponent
          id="create-game-event-description"
          placeholder="Event Description"
          value={event_description}
          onChangeText={handleEventDescriptionChange}
          style={modalStyles.componentStyle}
        />
        <View style={modalStyles.componentStyle}>
          <TextComponent>
            Public Event?
          </TextComponent>
          <Switch
            id="create-game-public-event-flag"
            value={public_event_flag}
            onValueChange={handlePublicEventFlagChange}
          />
        </View>
      </View>
    </ModalComponent>
  );
};
  // const [ address, setAddress ] = useState(createGameData.Address);

  // const handleAddressChange = (text) => {
  //   setAddress(text);
  // };

  // useEffect(() => {
  //   setAddress(createGameData.Address);
  // }, [createGameData.Address]);

{/* <TextInputComponent
id="create-game-address"
placeholder="Address"
value={address}
onChangeText={handleAddressChange}
/> */}



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
  textInputStyle: {
    margin: 20,
  },
  componentStyle: {
    margin: 8,
  }
});



  // const createEvent = async () => {
  //   const address = await getAddressFromCoordinates(
  //     location.lat,
  //     location.lng,
  //     googleMapsApiKey
  //   );
  //   const create_game_date_time = new Date(`${date_selected}T${time_selected}`);

  //   const params = {
  //     CreatedByID: userSession.UUID,
  //     Address: address,
  //     StartTimestamp: format(create_game_date_time, date_time_format),
  //     Host: userSession.Username,
  //     EventCreatedAt: format(new Date(), date_time_format),
  //     Lon: location.lng,
  //     PublicEventFlag: true,
  //     EndTimestamp: format(
  //       add(new Date(create_game_date_time), { hours: 1 }),
  //       date_time_format
  //     ),
  //     EventName: 'Pickup Basketball',
  //     Lat: location.lat,
  //   };
  //   console.log('Create Game params:', params);
  //   run_create_event(params);
  // };






  // const {
  //   transactionStatus: invite_friends_status,
  //   executeQuery: run_invite_friends,
  //   resetTransactionStatus: reset_invite_friends_transaction_status,
  // } = useCustomCypherWrite(INVITE_FRIENDS_TO_EVENT);

  // useEffect(() => {
  //   if (invite_friends_status.STATUS === 'ERROR') {
  //     toast.error(
  //       `Error Sending Event Invites: ${invite_friends_status.RESPONSE}`
  //     );
  //     console.log(invite_friends_status.RESPONSE);
  //     reset_invite_friends_transaction_status();
  //     setIsInviteFriendsToEventModalVisible(false);
  //     setEventUUID(null);
  //   } else if (invite_friends_status.STATUS === 'SUCCESS') {
  //     toast.success('Event Invites Sent!');
  //     reset_invite_friends_transaction_status();
  //     setIsInviteFriendsToEventModalVisible(false);
  //     setEventUUID(null);
  //   }
  // }, [invite_friends_status]);

  // const {
  //   transactionStatus: create_event_status,
  //   executeQuery: run_create_event,
  //   resetTransactionStatus: reset_create_event_transaction_status,
  // } = useCustomCypherWrite(CREATE_EVENT);

  // useEffect(() => {
  //   if (create_event_status.STATUS === 'ERROR') {
  //     toast.error(`Error Creating Event: ${create_event_status.RESPONSE}`);
  //     console.log(create_event_status.RESPONSE);
  //     setIsCreateGameMode(false);
  //   } else if (create_event_status.STATUS === 'SUCCESS') {
  //     console.log(
  //       'create_event_status.RESPONSE: ',
  //       create_event_status.RESPONSE
  //     );
  //     const event = create_event_status.RESPONSE.RECORDS[0];
  //     setEventUUID(event.UUID);
  //     toast.success('You Created an Event!');
  //     reset_create_event_transaction_status();
  //     resetCreateGameDetails();
  //     setIsInviteFriendsToEventModalVisible(true);
  //     setIsCreateGameMode(false);
  //   }
  // }, [create_event_status]);