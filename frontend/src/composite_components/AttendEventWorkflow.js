import React, { useEffect, useState } from 'react';
import { EventViewerModal, InviteFriendsToEventModal } from './Modals';
import {
  useAttendEventAndSendInvites,
  useFetchFriends,
 } from '../utils/Hooks';

import { AttendEventContext, UserSessionContext } from '../utils/Contexts';

export const AttendEventWorkflow = ({
  event,
  attend_event_stage,
  setAttendEventStage,
  attend_event_currently_active_data,
  setAttendEventCurrentlyActiveData,
  exitAttendEventMode,
  ...props


}) => {
  const { attend_event_context, setAttendEventContext } = React.useContext(AttendEventContext);
  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  const [friends_invited, setFriendsInvited] = useState([]);

  const [ is_creating_attending_event_relationship, setIsCreatingAttendingEventRelationship ] = useState(false);

  const [is_fetching_friends, setIsFetchingFriends] = useState(false);
  const [friends_list, setFriendsList] = useState([]);

  useEffect(() => {
    if (user_session && user_session.UUID) {
      setIsFetchingFriends(true);
    }
  }, [user_session]);

  useFetchFriends(user_session?.UUID, is_fetching_friends, setIsFetchingFriends, setFriendsList);

  const handleAttendEventButtonClick = () => {
    if (!user_session) {
      alert("You must be logged in to attend an event");
      return;
    } else {
      console.log("handleAttendEventButtonClicked")
      setAttendEventCurrentlyActiveData(prevData => ({
        ...prevData,
        EventUUID: prevData.UUID,
        AttendeeUUID: user_session.UUID,
        attending_stage: 2
      }));
      if (is_fetching_friends === false && friends_list.length > 0) {
        console.log("is_fetching_friends === false && friends_list.length > 0")
        setAttendEventStage(2);
      } else {
        console.log("is_fetching_friends === true || friends_list.length === 0")
        setAttendEventCurrentlyActiveData(prevData => ({
          ...prevData,
          InviteeUUIDs: []
        }));

        console.log("attend_event_currently_active_data", attend_event_currently_active_data)
        setIsCreatingAttendingEventRelationship(true);
      }
    }
  }

  const handleInviteFriendsToEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...attend_event_currently_active_data,
      InviteeUUIDs: friends_invited,
    })
    console.log("friends_invited", friends_invited)
    setIsCreatingAttendingEventRelationship(true);
  }

  useAttendEventAndSendInvites(is_creating_attending_event_relationship, attend_event_currently_active_data, setIsCreatingAttendingEventRelationship, setFriendsInvited, exitAttendEventMode);

  return (
    <>
      <EventViewerModal
        isVisible={!!(attend_event_currently_active_data && attend_event_currently_active_data.attending_stage === 1)}
        handleSubmitButtonClick={handleAttendEventButtonClick}
        event={attend_event_currently_active_data}
        onRequestClose={exitAttendEventMode}
      />
      <InviteFriendsToEventModal
        isVisible={!!(attend_event_currently_active_data && attend_event_currently_active_data.attending_stage === 2)}
        friends_invited={friends_invited}
        setFriendsInvited={setFriendsInvited}
        handleSubmitButtonClick={handleInviteFriendsToEventButtonClick}
        onRequestClose={exitAttendEventMode}
        friends_list={friends_list}
      />
    </>
  );
}
