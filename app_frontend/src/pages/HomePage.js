// HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import Layout from '../container_components/Layout';

import { day_start_time, day_end_time, day_format, iconSvgDataUrl } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateEventContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate, getAddressFromCoordinates } from '../utils/HelperFunctions';
import { useCreateEventNode, useFetchEvents, useFetchGoogleMapsApiKey, useFilterEvents } from '../utils/Hooks';

export function HomePage() {
  const mapRef = useRef();
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);
  const [fetching_events, setFetchingEvents] = useState(false);
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);
  // const [is_creating_event_node, setIsCreatingEventNode] = useState(false);

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null);
  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);

  const currentDateTime = new Date();
  const [find_event_start_time, setFindEventStartTime] = useState(day_start_time);
  const [find_event_end_time, setFindEventEndTime] = useState(day_end_time);
  const [find_event_selected_date, setFindEventSelectedDate] = useState(format(currentDateTime, day_format));
  const start_timestamp = convertUTCDateToLocalDate(new Date(`${find_event_selected_date}T${day_start_time}`));
  const end_timestamp = convertUTCDateToLocalDate(new Date(`${find_event_selected_date}T${day_end_time}`));

  useEffect(() => {
    setFetchingEvents(true);
  }, [find_event_selected_date]);


  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey, setFetchingEvents);
  useFetchEvents(fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setFetchingEvents);
  useFilterEvents(find_event_selected_date, find_event_start_time, find_event_end_time, map_events_full_day, event_types_selected, setMapEventsFiltered);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [create_event_stage, setCreateEventStage] = useState(1);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);


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


  const handleFindEventsButtonClick = () => {
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

  return (
    <Layout
      onFindEventsButtonClick={handleFindEventsButtonClick}
      onCreateEventButtonClick={handleCreateEventButtonClick}

      // LeftSidePanel props
      isLeftPanelVisible={isLeftPanelVisible}
      setIsLeftPanelVisible={setIsLeftPanelVisible}
      find_event_selected_date={find_event_selected_date}
      setFindEventSelectedDate={setFindEventSelectedDate}
      find_event_start_time={find_event_start_time}
      setFindEventStartTime={setFindEventStartTime}
      find_event_end_time={find_event_end_time}
      setFindEventEndTime={setFindEventEndTime}
      event_types_selected={event_types_selected}
      setEventTypesSelected={setEventTypesSelected}

      // Map props
      mapRef={mapRef}
      googleMapsApiKey={googleMapsApiKey}

      // CreateEvent props
      create_event_stage={create_event_stage}
      setCreateEventStage={setCreateEventStage}
      handleGetLocationCoordinates={handleGetLocationCoordinates}
      handleCreateEventDateTimeModalSubmitButtonClick={handleCreateEventDateTimeModalSubmitButtonClick}
      handleCreateEventEventTypeModalSubmitButtonClick={handleCreateEventEventTypeModalSubmitButtonClick}
      handleCreateEventDetailsModalSubmitButtonClick={handleCreateEventDetailsModalSubmitButtonClick}
      exitCreateEventMode={exitCreateEventMode}

    >
    </Layout>
  );
}

