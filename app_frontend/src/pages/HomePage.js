// HomePage.js

import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

import Layout from '../container_components/Layout';
import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { AttendEventContext, CreateEventContext, UserSessionContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { useFetchEvents, useFetchGoogleMapsApiKey, useFilterEvents } from '../utils/Hooks';

export function HomePage() {
  const mapRef = useRef();
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { user_session, setUserSession } = React.useContext(UserSessionContext);

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

  const [is_fetching_events, setIsFetchingEvents] = useState(true);
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);

  useEffect(() => {
    setIsFetchingEvents(true);
  }, [find_event_selected_date]);

  const [create_event_stage, setCreateEventStage] = useState(0);
  const { create_event_context, setCreateEventContext } = React.useContext(CreateEventContext);

  useFetchEvents(is_fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setIsFetchingEvents);
  useFilterEvents(find_event_selected_date, find_event_start_time, find_event_end_time, map_events_full_day, event_types_selected, setMapEventsFiltered);

  // Handle left side panel
  const [is_left_panel_visible, setIsLeftPanelVisible] = useState(false);
  const [is_event_invites_modal_visible, setIsEventInvitesModalVisible] = useState(false);
  const [is_friend_requests_modal_visible, setIsFriendRequestsModalVisible] = useState(false);

  const [attend_event_stage, setAttendEventStage] = useState(0);
  const [attend_event_currently_active_data, setAttendEventCurrentlyActiveData] = useState(null);
  const { attend_event_context, setAttendEventContext } = React.useContext(AttendEventContext);


  const initializeCreateEventMode = () => {
    resetAllStates();
    setCreateEventStage(1);
  };

  const exitCreateEventMode = () => {
    setCreateEventContext({});
    setCreateEventStage(0);
  };

  const initializeAttendEventMode = () => {
    resetAllStates();
    setAttendEventStage(1);
  };

  const exitAttendEventMode = () => {
    setAttendEventContext({});
    setAttendEventCurrentlyActiveData(null);
    setAttendEventStage(0);
  };

  const resetAllStates = () => {
    setIsLeftPanelVisible(false);
    setIsEventInvitesModalVisible(false);
    setIsFriendRequestsModalVisible(false);
    exitCreateEventMode();
    exitAttendEventMode();
  };

  return (
    <Layout
      //Navbar props
      resetAllStates={resetAllStates}

      // Find Events props
      is_left_panel_visible={is_left_panel_visible}
      setIsLeftPanelVisible={setIsLeftPanelVisible}

      // Event Invites props
      is_event_invites_modal_visible={is_event_invites_modal_visible}
      setIsEventInvitesModalVisible={setIsEventInvitesModalVisible}

      // Friend Requests props
      is_friend_requests_modal_visible={is_friend_requests_modal_visible}
      setIsFriendRequestsModalVisible={setIsFriendRequestsModalVisible}

      // CreateEvent props
      create_event_stage={create_event_stage}
      setCreateEventStage={setCreateEventStage}
      initializeCreateEventMode={initializeCreateEventMode}
      exitCreateEventMode={exitCreateEventMode}
      is_fetching_events={is_fetching_events}
      setIsFetchingEvents={setIsFetchingEvents}

      // Map props
      mapRef={mapRef}
      map_events_filtered={map_events_filtered}

      // LeftSidePanel props
      find_event_selected_date={find_event_selected_date}
      setFindEventSelectedDate={setFindEventSelectedDate}
      find_event_start_time={find_event_start_time}
      setFindEventStartTime={setFindEventStartTime}
      find_event_end_time={find_event_end_time}
      setFindEventEndTime={setFindEventEndTime}
      event_types_selected={event_types_selected}
      setEventTypesSelected={setEventTypesSelected}

      // AttendEvent props
      attend_event_stage={attend_event_stage}
      setAttendEventStage={setAttendEventStage}
      attend_event_currently_active_data={attend_event_currently_active_data}
      setAttendEventCurrentlyActiveData={setAttendEventCurrentlyActiveData}
      initializeAttendEventMode={initializeAttendEventMode}
      exitAttendEventMode={exitAttendEventMode}
    />
  );
};
