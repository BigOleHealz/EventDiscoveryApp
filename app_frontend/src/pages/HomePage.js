// HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

import Layout from '../container_components/Layout';
import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateEventContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { useFetchEvents, useFetchGoogleMapsApiKey, useFilterEvents } from '../utils/Hooks';

export function HomePage() {
  const mapRef = useRef();
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { user_session, setUserSession } = React.useContext(UserSessionContext);

  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);
  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);

  const currentDateTime = new Date();
  const [find_event_start_time, setFindEventStartTime] = useState(day_start_time);
  const [find_event_end_time, setFindEventEndTime] = useState(day_end_time);
  const [find_event_selected_date, setFindEventSelectedDate] = useState(format(currentDateTime, day_format));
  const start_timestamp = convertUTCDateToLocalDate(new Date(`${find_event_selected_date}T${day_start_time}`));
  const end_timestamp = convertUTCDateToLocalDate(new Date(`${find_event_selected_date}T${day_end_time}`));

  const [event_types_selected, setEventTypesSelected] = useState([]);

  useEffect(() => {
    if (user_session && user_session.Interests) {
      setEventTypesSelected(user_session.Interests);
    }
  }, [user_session]);

  const [fetching_events, setFetchingEvents] = useState(true);
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);

  useEffect(() => {
    setFetchingEvents(true);
  }, [find_event_selected_date]);

  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);

  useFetchGoogleMapsApiKey(fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey, setFetchingEvents);
  useFetchEvents(fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setFetchingEvents);
  useFilterEvents(find_event_selected_date, find_event_start_time, find_event_end_time, map_events_full_day, event_types_selected, setMapEventsFiltered);

  // Handle left side panel
  const [is_left_panel_visible, setIsLeftPanelVisible] = useState(false);
  const [create_event_stage, setCreateEventStage] = useState(0);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);


  const exitCreateEventMode = () => {
    setCreateEventContext({});
    setCreateEventStage(0);
  };

  const resetAllStates = () => {
    exitCreateEventMode();
    setIsLeftPanelVisible(false);
    // setIsEventInvitesPanelVisible(false);
    // setIsFriendRequestsPanelVisible(false);
  };

  const initializeCreateEventMode = () => {
    resetAllStates();
    setCreateEventStage(1);
  };

  const handleFindEventsButtonClick = () => {
    setIsLeftPanelVisible(!is_left_panel_visible);
    console.log('handleFindEventsButtonClick: is_left_panel_visible = ', is_left_panel_visible);
  };

  const handleCreateEventButtonClick = () => {
    initializeCreateEventMode();
    console.log('handleCreateEventButtonClick: create_event_stage = ', create_event_stage);
  };


  return (
    <Layout
      onFindEventsButtonClick={handleFindEventsButtonClick}
      onCreateEventButtonClick={handleCreateEventButtonClick}

      // LeftSidePanel props
      is_left_panel_visible={is_left_panel_visible}
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
      google_maps_api_key={google_maps_api_key}
      map_events_filtered={map_events_filtered}

      // CreateEvent props
      create_event_stage={create_event_stage}
      setCreateEventStage={setCreateEventStage}
      exitCreateEventMode={exitCreateEventMode}

    >
    </Layout>
  );
};
