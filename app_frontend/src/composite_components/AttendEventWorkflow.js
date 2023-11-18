import React, { useEffect, useState } from 'react';
import { EventViewerModal, InviteFriendsToEventModal } from './Modals';

import { UserSessionContext } from '../utils/Contexts';

export const AttendEventWorkflow = ({
  event,
  attend_event_stage,
  setAttendEventStage,
  attend_event_currently_active_data,
  setAttendEventCurrentlyActiveData,
  exitAttendEventMode,
  ...props


}) => {
  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  const [ is_creating_attending_event_relationship, setIsCreatingAttendingEventRelationship ] = useState(false);


  const handleAttendEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...attend_event_currently_active_data,
      attendee_uuid: user_session.UUID,
      attending_stage: 2
    })
    setAttendEventStage(2);
  }

  useEffect(() => {
    console.log("attend_event_currently_active_data changed", attend_event_currently_active_data)
  }, [attend_event_currently_active_data]);
  

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
        handleSubmitButtonClick={() => {console.log("Invite friends to event")}}
        onRequestClose={exitAttendEventMode}
      />
    </>
  );
}
