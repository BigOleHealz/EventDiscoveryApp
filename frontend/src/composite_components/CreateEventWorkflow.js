import React, { useState, useEffect } from 'react';
import { CreateEventLocationSelector } from './CreateEventLocationSelector';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal, CreateEventInviteFriendsModal } from './Modals';

import { CreateEventContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import {
  useCreateEventNode, 
  useFetchFriends
} from '../utils/Hooks';

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
  
  const [friends_invited, setFriendsInvited] = useState([]);
  const [is_fetching_friends, setIsFetchingFriends] = useState(false);
  const [friends_list, setFriendsList] = useState([]);

  console.log("friends_list", friends_list);
  
  useEffect(() => {
    if (user_session && user_session.UUID) {
      setIsFetchingFriends(true);
    }
  }, [user_session]);

  const handleEventCreation = () => {
    setCreateEventContext({
      ...create_event_context,
      CreatedByUUID: user_session.UUID
    });
    console.log('handleEventCreation: create_event_context = ', create_event_context);
    setIsCreatingEventNode(true);
  }

  useFetchFriends(user_session?.UUID, is_fetching_friends, setIsFetchingFriends, setFriendsList);
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
        handleSubmitButtonClick={() => setCreateEventStage(5)}
        onRequestClose={exitCreateEventMode}
      />
      <CreateEventInviteFriendsModal
        isVisible={create_event_stage === 5}
        friends_invited={friends_invited}
        setFriendsInvited={setFriendsInvited}
        handleSubmitButtonClick={handleEventCreation}
        onRequestClose={exitCreateEventMode}
        friends_list={friends_list}
      />
    </>
  );
}
