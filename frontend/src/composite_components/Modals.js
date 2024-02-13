import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import BoxComponent from '../base_components/BoxComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { ModalComponent } from '../base_components/ModalComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { FriendRequestsTable } from './Tables';
import { SelectInterestsScrollView } from './SelectInterestsScrollview';
import { SwitchComponent } from './SwitchComponent';
import { EventInvitesTable, EventTypesTable, InviteFriendsToEventTable } from './Tables';

import EventDetailsTable from './EventDetailsTable';

import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { AttendEventContext, AuthenticationContext, CreateEventContext, CreateUserProfileContext, UserSessionContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import {
  useCreateFriendRequestRelationshipIfNotExist,
  useFetchUsername
} from '../utils/Hooks';

import { friend_request_styles } from '../styles';

// export const EventViewerModal = ({
//   isVisible,
//   handleSubmitButtonClick,
//   event,
//   onRequestClose,
//   ...props
// }) => {

//   return (
//     <ModalComponent
//       isVisible={isVisible}
//       onRequestClose={onRequestClose}
//       title="Event Viewer"
//       submitButtonText="Attend Event"
//       onSubmitButtonClick={handleSubmitButtonClick}
//     >
//       <BoxComponent style={{ width: '100%', height: '100%' }}>
//         {event && event.EventURL ? (
//           <iframe
//             srcDoc={modifiedContent}
//             title="Event Content"
//             style={{
//               border: 'none',
//               width: '100%',
//               height: '100%'
//             }}
//           />
//         ) : event ? (
//           <EventDetailsTable event={event} />
//         ) : (
//           <div>Event URL not found.</div>
//         )}
//       </BoxComponent>
//     </ModalComponent>
//   );
// };


// export const InviteFriendsToEventModal = ({
//   isVisible,
//   friends_invited,
//   setFriendsInvited,
//   handleSubmitButtonClick,
//   onRequestClose,
//   ...props
// }) => {

//   return (
//     <ModalComponent
//       isVisible={isVisible}
//       onRequestClose={onRequestClose}
//       title="Invite Friends to Event"
//       submitButtonText="Send Invites"
//       onSubmitButtonClick={handleSubmitButtonClick}
//     >
//       <InviteFriendsToEventTable
//         friends_invited={friends_invited}
//         setFriendsInvited={setFriendsInvited}
//       />
//     </ModalComponent>
//   );
// }


// export const EventInvitesModal = ({
//   isVisible,
//   onRequestClose,
//   ...props
// }) => {

//   const { user_session, setUserSession } = useContext(UserSessionContext);

//   return (
//     <ModalComponent
//       isVisible={isVisible}
//       onRequestClose={onRequestClose}
//       title="Event Invites"
//       submitButtonText="Close"
//       onSubmitButtonClick={onRequestClose}
//     >
//       <EventInvitesTable user_session={user_session} />
//     </ModalComponent>
//   );
// }

// export const FriendRequestsModal = ({
//   isVisible,
//   onRequestClose,
//   ...props
// }) => {

//   const { user_session, setUserSession } = useContext(UserSessionContext);
//   if (!user_session) {
//     return null;
//   }

//   const height_text_input_and_button = { xs: '40px', sm: '45px', md: '50px', lg: '55px', xl: '60px' };
//   const margin_text_input_and_button = { xs: '3px', sm: '4px', md: '5px', lg: '6px', xl: '7px' };
//   const friend_request_vertical_margin = { xs: '5px', sm: '10px', md: '15px', lg: '20px', xl: '25px' }

//   const [friend_request_username, setFriendRequestUsername] = useState('');
//   const [sending_friend_request, setSendingFriendRequest] = useState(false);

//   useCreateFriendRequestRelationshipIfNotExist(user_session.Username, friend_request_username, sending_friend_request, setSendingFriendRequest, setFriendRequestUsername);

//   const handleFriendRequestUsernameChange = (text) => {
//     setFriendRequestUsername(text.target.value);
//   };

//   const handleSendFriendRequestButtonClick = () => {
//     if (friend_request_username === '') {
//       toast.error('Please enter a username.');
//     } else if (friend_request_username === user_session.Username) {
//       toast.error('You cannot send a friend request to yourself.');
//     } else {
//       setSendingFriendRequest(true);
//     }
//   };

//   return (
//     <ModalComponent
//       isVisible={isVisible}
//       onRequestClose={onRequestClose}
//       title="Manage Friends"
//       submitButtonText="Close"
//       onSubmitButtonClick={onRequestClose}
//     >
//       <Box sx={friend_request_styles.contentContainer}>
//         <Box label='box-send-friend-request' sx={friend_request_styles.sendRequestContainer}>
//           <TextInputComponent
//             id="input-friend-request-username"
//             label="Enter Friend's Username"
//             value={friend_request_username}
//             onChangeText={handleFriendRequestUsernameChange}
//             style={{
//               flexGrow: 1,
//               marginRight: margin_text_input_and_button,
//               height: height_text_input_and_button,
//               padding: 0
//             }}
//           />
//           <Button
//             id="button-friend-request-submit"
//             variant="contained"
//             color="primary"
//             onClick={handleSendFriendRequestButtonClick}
//             sx={{
//               marginLeft: margin_text_input_and_button,
//               height: height_text_input_and_button,
//               width: { xs: '120px', sm: '125px', md: '130px', lg: '140px', xl: '160px' }
//             }}
//           >
//             Send Request
//           </Button>
//         </Box>
//         <Divider
//           sx={{
//             marginTop: friend_request_vertical_margin,
//             marginBottom: friend_request_vertical_margin,
//             backgroundColor: 'grey'
//           }} />
//         <Box id='box-accept-decline-friend-request' sx={{ flexGrow: 1, position: 'relative', height: '100%' }}>
//           <FriendRequestsTable user_session={user_session} />
//         </Box>
//       </Box>
//     </ModalComponent>
//   );
// }

export const CreateEventInviteFriendsModal = ({
  isVisible,
  handleSubmitButtonClick,
  onRequestClose,
  ...props
}) => {
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const [ friends_invited, setFriendsInvited ] = useState([]);

  const addFriendInvitesToCreateEventContext = () => {
    setCreateEventContext({
      ...create_event_context,
      FriendsInvited: friends_invited
    })
    handleSubmitButtonClick();
  };

  return (
    <ModalComponent
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Invite Friends to Event"
      submitButtonText="Send Invites"
      onSubmitButtonClick={addFriendInvitesToCreateEventContext}
    >
      <InviteFriendsToEventTable
        friends_invited={friends_invited}
        setFriendsInvited={setFriendsInvited}
      />
    </ModalComponent>
  );
}
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
      <BoxComponent style={{ display: 'flex', flexDirection: 'column' }}>
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
      </BoxComponent>
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
      const new_data = {
        ...create_event_context,
        ...event_type
      }
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
      <BoxComponent style={{ display: 'flex', flexDirection: 'column' }}>
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
        {paid_event_flag &&
          <TextInputComponent
            id="input-event-price"
            label="Event Price ($)"
            value={event_price}
            onChangeText={handleEventPriceChange}
          />
        }
      </BoxComponent>
    </ModalComponent>
  );
};

export const CreateUsernameModal = ({
  isVisible,
  create_user_profile_context,
  setCreateUserProfileContext,
  onUsernameAvailable,
  onRequestClose,
}) => {

  const [username, setUsername] = useState('');
  const [fetching_username_is_taken, setFetchingUsernameExists] = useState(false);

  useFetchUsername(fetching_username_is_taken, username, setFetchingUsernameExists, create_user_profile_context, setCreateUserProfileContext, onUsernameAvailable);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmitButtonClick = () => {
    setFetchingUsernameExists(true);
  };

  return (
    <>
      <ModalComponent
        id="create-username-modal"
        isVisible={isVisible}
        onRequestClose={onRequestClose}
        title="Create Username"
        submitButtonText="Submit Username"
        onSubmitButtonClick={handleSubmitButtonClick}
      >
        <BoxComponent style={{ display: 'flex', flexDirection: 'column' }}>
          <TextInputComponent
            required={true}
            id="input-username"
            label="Enter Username"
            value={username}
            onChangeText={handleUsernameChange}
          />
        </BoxComponent>
      </ModalComponent>
    </>
  );
};

export const SelectInterestsModal = ({
  isVisible,
  create_user_profile_context,
  setCreateUserProfileContext,
  onSubmitButtonClick,
  onRequestClose,
}) => {

  const [event_types_selected, setEventTypesSelected] = useState([]);

  const handleSubmitButtonClick = () => {
    setCreateUserProfileContext({
      ...create_user_profile_context,
      InterestUUIDs: event_types_selected
    });
    onSubmitButtonClick();
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
      <EventTypesTable
        event_types_selected={event_types_selected}
        setEventTypesSelected={setEventTypesSelected}
      />
    </ModalComponent>
  );
};
