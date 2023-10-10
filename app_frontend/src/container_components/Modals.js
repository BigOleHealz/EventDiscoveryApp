import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView, CheckBox, Switch } from 'react-native';
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

// import { CalendarComponent } from '../base_components/CalendarComponent';
import { TextComponent } from '../base_components/TextComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
// import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { SelectInterestsScrollView } from '../composite_components/SelectInterestsScrollview';

import { ModalComponent } from '../base_components/ModalComponent';
import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { CreateUserProfileContext, UserSessionContext } from '../utils/Contexts';

// import {
//   CREATE_ACCOUNT_INTEREST_RELATIONSHIPS,
//   CREATE_EVENT,
//   INVITE_FRIENDS_TO_EVENT,
// } from '../db/queries';

import { CreateGameContext } from '../utils/Contexts';
import { modal_styles }  from '../styles';


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
      // menuButton={
        // <ButtonComponent
        //   id="create-game-select-event-type-button"
        //   title="Select Event Type"
        //   onPress={handleSubmitButtonClick}
        //   // style={styles.buttons.menu_button_styles}
        //   isMenuButton={true}
        // />
      // }
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
      <View style={modal_styles.itemContainer}>
        <CheckBox value={isChecked} onValueChange={onValueChange} />
        <Text style={modal_styles.itemText}>{name}</Text>
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
          // style={styles.buttons.menu_button_styles}
          isMenuButton={true}
        />
      }
    >
      <ScrollView style={modal_styles.scrollView}>
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
          // style={styles.buttons.menu_button_styles}
          isMenuButton={true}
        />
      }
    >
      <View>
        <TextInputComponent
          id="create-game-event-name"
          placeholder="Event Name"
          value={event_name}
          onChangeText={handleEventNameChange}
          style={modal_styles.componentStyle}
        />
        <TextInputComponent
          id="create-game-event-description"
          placeholder="Event Description"
          value={event_description}
          onChangeText={handleEventDescriptionChange}
          style={modal_styles.componentStyle}
        />
        <View style={modal_styles.componentStyle}>
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



export const CreateUsernameModal = ({
  isVisible,
  onRequestClose,
  onUsernameAvailable,
}) => {

  const [username, setUsername] = useState('');
  const [fetching_username_is_taken, setFetchingUsernameExists] = useState(false);
  const { create_user_profile_context, setCreateUserProfileContext } = React.useContext(CreateUserProfileContext);

  const handleUsernameChange = (text) => {
    setUsername(text);
  };

  const handleSubmitButtonClick = () => {
    setFetchingUsernameExists(true);
  };

  useEffect(() => {
    if (fetching_username_is_taken) {
      fetch('/api/is_username_taken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (data) {
            if (data.usernameExists === true) {
              const message = `Username is taken!`;
              toast.error(message);
              console.error(message);
            } else {
              const message = `Username is available!`;
              toast.success(message);
              console.log(message);
              setCreateUserProfileContext({
                ...create_user_profile_context,
                Username: username,
                UUID: uuidv4(),
              });
              onUsernameAvailable();
            }
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while checking if username exists!');
        });
    }
    setFetchingUsernameExists(false);
  }, [fetching_username_is_taken]);

  return (
    <>
      <ToastContainer />
      <ModalComponent
        id="create-username-modal"
        isVisible={isVisible}
        onRequestClose={onRequestClose}
        title="Create Username"
        submitButtonText="Submit Username"
        onSubmitButtonClick={handleSubmitButtonClick}
      >
        <div>
          <TextInputComponent
            id="input-username"
            placeholder="Enter Username"
            value={username}
            onChangeText={handleUsernameChange}
          />
        </div>
      </ModalComponent>
    </>
  );
};

export const SelectInterestsModal = ({
  isVisible,
  setIsSelectInterestsModalVisible,
  onRequestClose,
  onInterestsSelected,
  accountUUID,
  onSubmitButtonClick,
  updateSelectedUUIDs
}) => {

  const [event_types_selected, setEventTypesSelected] = useState([]);

  const handleSubmitButtonClick = () => {
    updateSelectedUUIDs(event_types_selected); // Update the selected UUIDs
    onSubmitButtonClick(event_types_selected); // Call the original submit function with the latest selectedUUIDs
  }

  return (
    <ModalComponent
      testid="select-interests-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="What Type of Events Do You Like?"
      submitButtonText="Submit Interests"
      onSubmitButtonClick={handleSubmitButtonClick}
    >
      <SelectInterestsScrollView setEventTypesSelected={setEventTypesSelected} />
    </ModalComponent>
  );
};






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