import React, { useEffect, useState } from 'react';
import { EventViewerModal, InviteFriendsToEventModal } from './Modals';
import { useAttendEventAndSendInvites } from '../utils/Hooks';

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


  const handleAttendEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...attend_event_currently_active_data,
      EventUUID: attend_event_currently_active_data.UUID,
      AttendeeUUID: user_session.UUID,
      attending_stage: 2
    })
    setAttendEventStage(2);
  }

  const handleInviteFriendsToEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...attend_event_currently_active_data,
      InviteeUUIDs: friends_invited,
    })
    console.log("friends_invited", friends_invited)
    setIsCreatingAttendingEventRelationship(true);
  }

  useAttendEventAndSendInvites(is_creating_attending_event_relationship, attend_event_currently_active_data, setIsCreatingAttendingEventRelationship, exitAttendEventMode);

  useEffect(() => {
    console.log("friends_invited changed", friends_invited)
  }, [friends_invited]);
  

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
      />
    </>
  );
}
