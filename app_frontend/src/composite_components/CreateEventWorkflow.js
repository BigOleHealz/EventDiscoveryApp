import React, { useState } from 'react';
import { CreateEventLocationSelector } from './CreateEventLocationSelector';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from './Modals';

import { CreateEventContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { useCreateEventNode } from '../utils/Hooks';

export const CreateEventWorkflow = ({
  create_event_stage,
  setCreateEventStage,
  mapRef,
  exitCreateEventMode,
  is_fetching_events,
  setIsFetchingEvents,
  ...props
}) => {
  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const [is_creating_event_node, setIsCreatingEventNode] = useState(false);

  const handleEventCreation = () => {
    setCreateEventContext({
      ...create_event_context,
      CreatedByUUID: user_session.UUID
    });
    console.log('handleEventCreation: create_event_context = ', create_event_context);
    setIsCreatingEventNode(true);
  }

  useCreateEventNode(is_creating_event_node, create_event_context, setIsCreatingEventNode, setCreateEventStage, setIsFetchingEvents);

  return (
    <>
      <CreateEventLocationSelector
        isVisible={create_event_stage === 1}
        mapRef={mapRef}
        setCreateEventStage={setCreateEventStage}
      />
      <CreateEventDatetimeModal
        isVisible={create_event_stage === 2}
        handleSubmitButtonClick={() => setCreateEventStage(3)}
        onRequestClose={exitCreateEventMode}
      />
      <CreateEventSelectEventTypeModal
        isVisible={create_event_stage === 3}
        handleSubmitButtonClick={() => setCreateEventStage(4)}
        onRequestClose={exitCreateEventMode}
      />
      <CreateEventDetailsModal
        isVisible={create_event_stage === 4}
        handleSubmitButtonClick={handleEventCreation}
        onRequestClose={exitCreateEventMode}
      />
    </>
  );
}
