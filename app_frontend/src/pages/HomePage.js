// HomePage.js

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { Toolbar } from '../container_components/Toolbar';
import { Map } from '../container_components/Map';
import { LeftSidePanel } from '../container_components/LeftSidePanel';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from '../container_components/Modals';

import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateEventContext } from '../utils/Contexts';
import { useCreateEventNode } from '../utils/Hooks';
import { common_styles }  from '../styles';

export function HomePage() {

  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);
  const [is_creating_event_node, setIsCreatingEventNode] = useState(false);

  useCreateEventNode(is_creating_event_node, create_event_context, setIsCreatingEventNode);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateEventMode, setIsCreateEventMode] = useState(false);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  if (!userSession) {
    return null;
  }

  const [ isCreateEventDateTimeModalVisible, setIsCreateEventDateTimeModalVisible ] = useState(false);
  const [ isCreateEventSelectEventTypeModalVisible, setIsCreateEventSelectEventTypeModalVisible ] = useState(false);
  // const [ isCreateEventInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);
  const [ isCreateEventDetailsModalVisible, setIsCreateEventDetailsModalVisible ] = useState(false);


  const resetAllStates = () => {
    setIsLeftPanelVisible(false);
    setIsCreateEventMode(false);
    setIsEventInvitesPanelVisible(false);
    setIsFriendRequestsPanelVisible(false);
  };

  const currentDateTime = new Date();
  const [findEventStartTime, setFindEventStartTime] = useState(day_start_time);
  const [findEventEndTime, setFindEventEndTime] = useState(day_end_time);
  const [findEventSelectedDate, setFindEventSelectedDate] = useState(format(currentDateTime, day_format));

  const handleFindEventsButtonClick = () => {
    console.log('Find Events button clicked')
    resetAllStates();
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  const handleCreateEventButtonClick = () => {
    console.log('Create Event button clicked')
    resetAllStates();
    setIsCreateEventDateTimeModalVisible(true);
  };

  const exitCreateEventMode = () => {
    setIsCreateEventDateTimeModalVisible(false);
    setIsCreateEventSelectEventTypeModalVisible(false);
    // setIsInviteFriendsToEventModalVisible(false);
    setIsCreateEventDetailsModalVisible(false);
    setCreateEventContext({});
    setIsCreateEventMode(false);
  };

  const handleCreateEventDateTimeModalSubmitButtonClick = () => {
    setIsCreateEventDateTimeModalVisible(false);
    setIsCreateEventSelectEventTypeModalVisible(true);
  };

  const handleCreateEventEventTypeModalSubmitButtonClick = () => {
    setIsCreateEventSelectEventTypeModalVisible(false);
    setIsCreateEventDetailsModalVisible(true);
  };

  const handleCreateEventDetailsModalSubmitButtonClick = () => {
    createEvent();
    setIsCreateEventDetailsModalVisible(false);
    // setIsInviteFriendsToEventModalVisible(true);
  };

  const createEvent = () => {
    setCreateEventContext({
      ...create_event_context,
      CreatedByUUID: userSession.UUID
    });
    setIsCreatingEventNode(true);
  };

  return (
    <>
      <div style={common_styles.container}>
        <Toolbar
          onLeftButtonClick={handleFindEventsButtonClick}
          onRightButtonClick={handleCreateEventButtonClick}
        />
      </div>
      <div style={common_styles.fullScreen}>
        <Map
          findEventSelectedDate={findEventSelectedDate}
          findEventStartTime={findEventStartTime}
          findEventEndTime={findEventEndTime}
          eventTypesSelected={event_types_selected}
        />
        <LeftSidePanel
          isVisible={isLeftPanelVisible}
          findEventSelectedDate={findEventSelectedDate}
          setFindEventSelectedDate={setFindEventSelectedDate}
          findEventStartTime={findEventStartTime}
          setFindEventStartTime={setFindEventStartTime}
          findEventEndTime={findEventEndTime}
          setFindEventEndTime={setFindEventEndTime}
          eventTypesSelected={event_types_selected}
          setEventTypesSelected={setEventTypesSelected}
        />
        <CreateEventDatetimeModal
          isVisible={isCreateEventDateTimeModalVisible}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventDateTimeModalSubmitButtonClick}
        />
        <CreateEventSelectEventTypeModal
          isVisible={isCreateEventSelectEventTypeModalVisible}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventEventTypeModalSubmitButtonClick}
        />
        <CreateEventDetailsModal
          isVisible={isCreateEventDetailsModalVisible}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventDetailsModalSubmitButtonClick}
        />
      </div>
    </>
  );
}
