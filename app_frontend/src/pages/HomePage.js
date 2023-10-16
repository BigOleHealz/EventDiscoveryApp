// HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

import { CreateEventLocationSelector } from '../composite_components/CreateEventLocationSelector';
import { LeftSidePanel } from '../container_components/LeftSidePanel';
import { Map } from '../container_components/Map';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from '../container_components/Modals';
import { Toolbar } from '../container_components/Toolbar';

import { day_start_time, day_end_time, day_format, iconSvgDataUrl } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateEventContext } from '../utils/Contexts';
import { useCreateEventNode } from '../utils/Hooks';
import { common_styles, map_styles }  from '../styles';

export function HomePage() {
  const mapRef = useRef();
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);
  const [is_creating_event_node, setIsCreatingEventNode] = useState(false);

  useCreateEventNode(is_creating_event_node, create_event_context, setIsCreatingEventNode);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [create_event_stage, setCreateEventStage] = useState(0);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  if (!userSession) {
    return null;
  }
  // const [ isCreateEventInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);


  const resetAllStates = () => {
    setIsLeftPanelVisible(false);
    // setCreateEventStage(0);
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
    resetAllStates();
    // setIsCreateEventDateTimeModalVisible(true);
    setCreateEventStage(1);
    console.log('Create Event button clicked')
  };

  const exitCreateEventMode = () => {
    setCreateEventContext({});
    setCreateEventStage(0);
  };


  const handleGetLocationCoordinates = () => {
    const center = mapRef.current.getCenter();
    setCreateEventContext({
      ...create_event_context,
      Lat: center.lat(),
      Lon: center.lng()
    });
    setCreateEventStage(2);
    console.log('Center coordinates:', center.lat(), center.lng());
  };

  const handleCreateEventDateTimeModalSubmitButtonClick = () => {
    setCreateEventStage(3);
  };

  const handleCreateEventEventTypeModalSubmitButtonClick = () => {
    setCreateEventStage(4);
  };

  const handleCreateEventDetailsModalSubmitButtonClick = () => {
    createEvent();
    exitCreateEventMode();
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
          mapRef={mapRef}
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
        { create_event_stage === 1 &&
          <CreateEventLocationSelector handleGetLocationCoordinates={handleGetLocationCoordinates} />
        }
        <CreateEventDatetimeModal
          isVisible={create_event_stage === 2}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventDateTimeModalSubmitButtonClick}
        />
        <CreateEventSelectEventTypeModal
          isVisible={create_event_stage === 3}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventEventTypeModalSubmitButtonClick}
        />
        <CreateEventDetailsModal
          isVisible={create_event_stage === 4}
          onRequestClose={exitCreateEventMode}
          onSubmitButtonClick={handleCreateEventDetailsModalSubmitButtonClick}
        />
      </div>
    </>
  );
}
