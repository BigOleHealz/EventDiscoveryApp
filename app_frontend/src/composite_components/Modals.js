import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { format } from 'date-fns';

import { CalendarComponent } from '../base_components/CalendarComponent';
import { ModalComponent } from '../base_components/ModalComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { SelectInterestsScrollView } from './SelectInterestsScrollview';
import { SwitchComponent } from './SwitchComponent';

import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { CreateEventContext, CreateUserProfileContext, UserSessionContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { useFetchUsername } from '../utils/Hooks';


export const CreateEventDatetimeModal = ({
  isVisible,
  handleSubmitButtonClick,
  onRequestClose
}) => {
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);

  const currentDateTime = new Date();
  const [selected_date, setSelectedDate] = useState(format(currentDateTime, day_format));
  const [start_time, setStartTime] = useState(day_start_time);
  const [end_time, setEndTime] = useState(day_end_time);

  const addDateTimesToCreateEventContext = () => {
    const start_timestamp = convertUTCDateToLocalDate(new Date(`${selected_date}T${start_time}`));
    const end_timestamp = convertUTCDateToLocalDate(new Date(`${selected_date}T${end_time}`));
    setCreateEventContext({
      ...create_event_context,
      StartTimestamp: start_timestamp,
      EndTimestamp: end_timestamp
    })
    handleSubmitButtonClick();
  }
  return (
    <ModalComponent
      id="create-event-datetime-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="When is the Event?"
      submitButtonText="Submit Datetime"
      onSubmitButtonClick={addDateTimesToCreateEventContext}
    >
      <CalendarComponent
        testid="left-calendar"
        selected={selected_date}
        onDateSelected={setSelectedDate}
      />
      <TimeRangeSliderComponent
        startTime={start_time}
        setStartTime={setStartTime}
        endTime={end_time}
        setEndTime={setEndTime}
      />
    </ModalComponent>
  )
}

export const CreateEventSelectEventTypeModal = ({
  isVisible,
  handleSubmitButtonClick,
  onRequestClose,
}) => {
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const [event_type, setEventType] = useState(null);

  const addEventTypeToCreateEventContext = () => {
    if (!event_type) {
      toast.error('Please select an event type.');
      return;
    } else {
      const new_data = {...create_event_context, ...event_type}
      console.log("new_data", new_data)
      setCreateEventContext({
        ...create_event_context,
        ...event_type
      });
      handleSubmitButtonClick();
    }
  };

  return (
    <ModalComponent
      id="create-event-select-event-type-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="What Type of Event is This?"
      submitButtonText="Submit Event Type"
      onSubmitButtonClick={addEventTypeToCreateEventContext}
    >
      <SelectInterestsScrollView
        setEventTypesSelected={setEventType}
        singleSelect={true}
      />
    </ModalComponent>
  );
};


export const CreateEventDetailsModal = ({
  isVisible,
  handleSubmitButtonClick,
  onRequestClose,
}) => {
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const [event_name, setEventName] = useState('');
  const [event_description, setEventDescription] = useState('');
  const [private_event_flag, setPrivateEventFlag] = useState(false);
  const [paid_event_flag, setPaidEventFlag] = useState(false);
  const [event_price, setEventPrice] = useState('');

  const resetCreateEventDetails = () => {
    setEventName('');
    setEventDescription('');
    setPrivateEventFlag(false);
    setPaidEventFlag(false);
    setEventPrice('');
  };

  const addDetailsToCreateEventContext = () => {
    const public_event_flag = !private_event_flag;
    const free_event_flag = !paid_event_flag;
    let event_price_string;
    if (free_event_flag) {
      event_price_string = 'Free'
    } else {
      if (!event_price) {
        toast.error('Please enter an event price or make the event free.');
        return;
      } else {
        const event_price_float = parseFloat(event_price);
        if (isNaN(event_price_float)) {
          toast.error('Event price must be a number.');
          return;
        }
        if (Math.round(event_price_float * 100) / 100 !== event_price_float) {
          toast.error('Event price can have a maximum of 2 decimal places.');
          return;
        }
        event_price_string = `$${event_price_float.toFixed(2)}`
      }
    }

    const new_data = {
      ...create_event_context,
      EventName: event_name,
      EventDescription: event_description,
      PublicEventFlag: public_event_flag,
      FreeEventFlag: free_event_flag,
      Price: event_price_string
    }
    setCreateEventContext(new_data);
    handleSubmitButtonClick()
    resetCreateEventDetails();
  };

  const handleEventNameChange = (text) => {
    setEventName(text.target.value);
  };

  const handleEventDescriptionChange = (text) => {
    setEventDescription(text.target.value);
  };

  const handlePrivateEventFlagChange = (value) => {
    setPrivateEventFlag(!private_event_flag);
  }

  const handlePaidEventFlagChange = (value) => {
    setPaidEventFlag(!paid_event_flag);
  }

  const handleEventPriceChange = (text) => {
    setEventPrice(text.target.value);
  };

  return (
    <ModalComponent
      id="create-event-event-details-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Event Details"
      submitButtonText="Submit Event Details"
      onSubmitButtonClick={addDetailsToCreateEventContext}
    >
      <TextInputComponent
        id="input-event-name"
        label="Event Name"
        value={event_name}
        onChangeText={handleEventNameChange}
      />
      <TextInputComponent
        id="input-event-description"
        label="Event Description"
        value={event_description}
        onChangeText={handleEventDescriptionChange}
        multiline={true}
      />
      <SwitchComponent
        id="switch-private-event"
        label="Private Event"
        checked={private_event_flag}
        onChange={handlePrivateEventFlagChange}
      />
      <SwitchComponent
        id="switch-paid-event"
        label="Paid Event"
        checked={paid_event_flag}
        onChange={handlePaidEventFlagChange}
      />
      { paid_event_flag &&
        <TextInputComponent
          id="input-event-price"
          label="Event Price ($)"
          value={event_price}
          onChangeText={handleEventPriceChange}
        />
      }
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

  useFetchUsername(fetching_username_is_taken, username, setFetchingUsernameExists, setCreateUserProfileContext, create_user_profile_context, onUsernameAvailable);

  const handleUsernameChange = (event) => {
    console.log("event", event)
    setUsername(event.target.value);
  };

  const handleSubmitButtonClick = () => {
    console.log('Username:', username)
    setFetchingUsernameExists(true);
  };

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
            required={true}
            id="input-username"
            label="Enter Username"
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
  // setIsSelectInterestsModalVisible,
  onRequestClose,
  // onInterestsSelected,
  // accountUUID,
  onSubmitButtonClick,
  updateSelectedUUIDs
}) => {

  const [event_types_selected, setEventTypesSelected] = useState([]);

  const handleSubmitButtonClick = () => {
    updateSelectedUUIDs(event_types_selected);
    onSubmitButtonClick(event_types_selected);
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
  //     setIsCreateEventMode(false);
  //   } else if (create_event_status.STATUS === 'SUCCESS') {
  //     console.log(
  //       'create_event_status.RESPONSE: ',
  //       create_event_status.RESPONSE
  //     );
  //     const event = create_event_status.RESPONSE.RECORDS[0];
  //     setEventUUID(event.UUID);
  //     toast.success('You Created an Event!');
  //     reset_create_event_transaction_status();
  //     resetCreateEventDetails();
  //     setIsInviteFriendsToEventModalVisible(true);
  //     setIsCreateEventMode(false);
  //   }
  // }, [create_event_status]);



// export const InviteFriendsToEventModal = ({
//   isVisible,
//   setIsInviteFriendsToEventModalVisible,
//   setIsCreateEventDetailsModalVisible,
//   onRequestClose,
//   isCreateEventMode,
//   event_uuid
// }) => {
// 	const { user_session, setUserSession } = React.useContext(UserSessionContext);
//   const { createEventData, setCreateEventData } = React.useContext(CreateEventContext);

//   const initialFriends = user_session.Friends.map((friend) => {
//     return {
//       ...friend,
//       isChecked: false,
//     };
//   });

//   const [friends, setFriends] = React.useState(initialFriends);
//   const [anyChecked, setAnyChecked] = React.useState(false);

//   const handleValueChange = (index, newValue) => {
//     const updatedFriends = friends.map((friend, i) => {
//       if (i === index) {
//         return { ...friend, isChecked: newValue };
//       }
//       return friend;
//     });
//     setFriends(updatedFriends);
//     setAnyChecked(updatedFriends.some((friend) => friend.isChecked));
//   };

//   const {
// 		transactionStatus: invite_friends_to_event_status,
// 		executeQuery: run_invite_friends_to_event,
// 		resetTransactionStatus: reset_invite_friends_to_event_transaction_status
// 	} = useCustomCypherWrite(INVITE_FRIENDS_TO_EVENT);

//   const invite_friends_to_event = (invite_uuid_list) => {
// 		console.log("Creating Event: ", invite_uuid_list);
// 		run_invite_friends_to_event(invite_uuid_list);
// 	};

//   useEffect(() => {
// 		if (invite_friends_to_event_status.STATUS === 'ERROR') {
//       const error_message = `Error Sending Event Invites: ${invite_friends_to_event_status.RESPONSE}`;
// 			toast.error(error_message);
// 			console.log(error_message);
// 			reset_invite_friends_to_event_transaction_status();
// 		} else if (invite_friends_to_event_status.STATUS === 'SUCCESS') {
// 			toast.success(`Event Invites Sent Successfully!`);
// 			reset_invite_friends_to_event_transaction_status();
// 		}
// 	}, [invite_friends_to_event_status]);

//   const handleSubmitButtonClick = () => {
//     const selectedFriendUUIDs = friends
//       .filter((friend) => friend.isChecked)
//       .map((friend) => friend.friendUUID);
//     console.log('Selected friends:', selectedFriendUUIDs);

//     if (isCreateEventMode) {
//       setCreateEventData({
//         ...createEventData,
//         InvitedFriends: selectedFriendUUIDs
//       });
//       setIsInviteFriendsToEventModalVisible(false);
//       setIsCreateEventDetailsModalVisible(true);
//     } else if (!event_uuid) {
//       const error_message = `Error: No Event UUID`;
//       toast.error(error_message);
//       console.log(error_message);
//       setIsInviteFriendsToEventModalVisible(false);
//     } else {
//       invite_friends_to_event({
//         "event_uuid" : event_uuid,
//         "inviter_uuid" : user_session.UUID,
//         "friend_invite_list" : selectedFriendUUIDs,
//       });
//       setIsInviteFriendsToEventModalVisible(false);
//     }
//   }

//   const FriendChecklistItem = ({ name, isChecked, onValueChange }) => {
//     return (
//       <View style={select_interests_scrollview_styles.itemContainer}>
//         <CheckBox value={isChecked} onValueChange={onValueChange} />
//         <Text style={select_interests_scrollview_styles.itemText}>{name}</Text>
//       </View>
//     );
//   };

//   return (
//     <ModalComponent
//       id="create-event-invite-friend-modal"
//       isVisible={isVisible}
//       onRequestClose={onRequestClose}
//       title="Invite Friends"
//       menuButton={
//         <ButtonComponent
//           id="create-event-invite-friends-button"
//           title={
//             anyChecked ? 'Send Invites & Create Event' : 'Skip & Create Event'
//           }
//           onPress={handleSubmitButtonClick}
//           // style={styles.buttons.menu_button_styles}
//           isMenuButton={true}
//         />
//       }
//     >
//       <ScrollView style={modal_styles.scrollView}>
//         {friends.map((friend, index) => (
//           <FriendChecklistItem
//             key={friend.friendUUID}
//             name={friend.friendUsername}
//             isChecked={friend.isChecked}
//             onValueChange={(newValue) => handleValueChange(index, newValue)}
//           />
//         ))}
//       </ScrollView>
//     </ModalComponent>
//   );
// };
