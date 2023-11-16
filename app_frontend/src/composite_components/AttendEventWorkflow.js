import React, { useState } from 'react';
import { EventViewerModal } from './Modals';

import { AttendEventContext, UserSessionContext } from '../utils/Contexts';

export const AttendEventWorkflow = ({
  event,
  attend_event_stage,
  setAttendEventStage,
  exitAttendEventMode,
  ...props


}) => {
  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  const { attend_event_context, setAttendEventContext } = React.useContext(AttendEventContext);
  const [ is_creating_attending_event_relationship, setIsCreatingAttendingEventRelationship ] = useState(false);

  const handleAttendEventCreation= () => {
    setAttendEventContext({
      ...attend_event_context,
      attendee_uuid: user_session.UUID
    });
    console.log('handleAttendEventCreation: attend_event_context = ', attend_event_context);
  }

  return (
    <>
      <EventViewerModal
        isVisible={attend_event_stage === 1}
        setCreateEventStage={handleAttendEventCreation}
        event={event}
        onRequestClose={exitAttendEventMode}
      />
    </>
  );
}