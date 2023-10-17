// HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { ButtonComponent } from '../base_components/ButtonComponent'; // Assuming you also have a web version of this
import { CreateEventLocationSelector } from '../composite_components/CreateEventLocationSelector';
import { LeftSidePanel } from '../container_components/LeftSidePanel';
import { Map } from '../container_components/Map';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from '../container_components/Modals';
import { Toolbar } from '../container_components/Toolbar';

import { day_start_time, day_end_time, day_format, iconSvgDataUrl } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateEventContext } from '../utils/Contexts';
import { getAddressFromCoordinates } from '../utils/HelperFunctions';
import { useCreateEventNode, useFetchGoogleMapsApiKey } from '../utils/Hooks';
import { removeUserSession } from '../utils/SessionManager';
import { common_styles, map_styles } from '../styles';

export function HomePage() {
  const mapRef = useRef();
  const navigate = useNavigate();
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  const { logger, setLogger } = React.useContext(LoggerContext);
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);
  const [is_creating_event_node, setIsCreatingEventNode] = useState(false);

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null);
  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [fetching_events, setFetchingEvents] = useState(false);

  const removeSession = removeUserSession();

  logger.info("HomePage component is initializing...");

  useCreateEventNode(is_creating_event_node, create_event_context, setIsCreatingEventNode);
  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey, setFetchingEvents);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [create_event_stage, setCreateEventStage] = useState(0);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  useEffect(() => {
    if (!userSession) {
      navigate('/login');
      console.log('userSession is null');
    }
  }, [userSession, navigate]);


  const exitCreateEventMode = () => {
    setCreateEventContext({});
    setCreateEventStage(0);
  };

  const resetAllStates = () => {
    exitCreateEventMode();
    setIsLeftPanelVisible(false);
    setIsEventInvitesPanelVisible(false);
    setIsFriendRequestsPanelVisible(false);
  };

  const initializeCreateEventMode = () => {
    resetAllStates();
    setCreateEventStage(1);
  };

  const currentDateTime = new Date();
  const [findEventStartTime, setFindEventStartTime] = useState(day_start_time);
  const [findEventEndTime, setFindEventEndTime] = useState(day_end_time);
  const [findEventSelectedDate, setFindEventSelectedDate] = useState(format(currentDateTime, day_format));

  const handleFindEventsButtonClick = () => {
    // resetAllStates();
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  const handleCreateEventButtonClick = () => {
    initializeCreateEventMode();
  };



  const handleGetLocationCoordinates = async () => {
    const center = mapRef.current.getCenter();
    const lat = center.lat();
    const lng = center.lng();
    const address = await getAddressFromCoordinates(lat, lng, googleMapsApiKey);
    setCreateEventContext({
      ...create_event_context,
      Lat: lat,
      Lon: lng,
      Address: address
    });
    setCreateEventStage(2);
    console.log('Center coordinates:', lat, lng, 'Address:', address);
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
          googleMapsApiKey={googleMapsApiKey}
          userSession={userSession}
          setUserSession={setUserSession}
          fetching_events={fetching_events}
          setFetchingEvents={setFetchingEvents}
          findEventSelectedDate={findEventSelectedDate}
          findEventStartTime={findEventStartTime}
          findEventEndTime={findEventEndTime}
          eventTypesSelected={event_types_selected}
        />

        <ButtonComponent
          id="button-logout"
          title="Logout"
          onPress={() => {
            removeSession();
            setUserSession(null);  // Now you're calling setUserSession directly in the component
          }}
          style={map_styles.logoutButtonStyle}
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
