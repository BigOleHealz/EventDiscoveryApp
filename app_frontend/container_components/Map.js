import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useReadCypher, useWriteCypher } from 'use-neo4j';
import { add, format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import {
  CreateGameDateTimeModal,
  InviteFriendsToEventModal
} from './Modals';
import { ButtonComponent } from '../base_components/ButtonComponent';
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { recordsAsObjects } from '../db/DBHandler';
import { FETCH_EVENTS_FOR_MAP, CREATE_EVENT, CREATE_ATTEND_EVENT_RELATIONSHIP, INVITE_FRIENDS_TO_EVENT } from '../db/queries'
import { useCustomCypherWrite } from '../hooks/CustomCypherHooks';
import { getSecretValue } from '../utils/AWSHandler';
import { day_start_time, day_end_time, date_time_format } from '../utils/constants';
import { getAddressFromCoordinates } from '../utils/HelperFunctions';
import { removeUserSession } from '../utils/SessionManager';
import pinIcon from '../assets/pin.png';


export const Map = ({
  isCreateGameMode,
  setIsCreateGameMode,
  findGameSelectedDate,
  findGameStartTime,
  findGameEndTime,
  userSession,
  setUserSession
}) => {

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };

  const [event_uuid, setEventUUID] = useState(null);


  const [isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible] = useState(false);
  const [isCreateGameInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible] = useState(false);

  // Handle Create Game vars
  const [create_game_location, setCreateGameLocation] = useState(null);
  // const [create_game_date_time, setCreateGameDateTime] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(false);


  // Attend Event
  const {
    transactionStatus: attend_event_status,
    executeQuery: run_attend_event,
    resetTransactionStatus: reset_attend_event_transaction_status
  } = useCustomCypherWrite(CREATE_ATTEND_EVENT_RELATIONSHIP);

  useEffect(() => {
    if (attend_event_status.STATUS === 'ERROR') {
      toast.error(`Error Creating Account: ${attend_event_status.RESPONSE}`);
      console.log(attend_event_status.RESPONSE);
    } else if (attend_event_status.STATUS === 'SUCCESS') {
      toast.success("You RSVP'd to this event!");
      reset_attend_event_transaction_status();
      setIsInviteFriendsToEventModalVisible(true);
    }
  }, [attend_event_status]);


  // Create Event




  const resetCreateGameDetails = () => {
    setCreateGameLocation(null);
  };


  // Handle Map
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null); // Add this state to store the API key
  useEffect(() => {
    const fetchSecrets = async () => {
      const secrets = await getSecretValue('google_maps_api_key');
      if (secrets) {
        // Use the secrets, e.g., set the API key
        setGoogleMapsApiKey(JSON.parse(secrets).GOOGLE_MAPS_API_KEY);
      }
    };

    fetchSecrets();
  }, []);
  const mapRef = React.useRef();
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // Handle Map Events
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);

  const start_timestamp = `${findGameSelectedDate}T${day_start_time}`;
  const end_timestamp = `${findGameSelectedDate}T${day_end_time}`;

  const {
    loading,
    error,
    records,
    run,
  } = useReadCypher(FETCH_EVENTS_FOR_MAP);

  useEffect(() => {
    console.log('findGameSelectedDate changed', findGameSelectedDate);
    const params = {
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp
    }
    run(params); // Run the query when findGameSelectedDate changes
  }, [findGameSelectedDate, transactionStatus === false]);

  useEffect(() => {
    if (!loading && !error && records) {
      const mapEventsObjectList = recordsAsObjects(records)
      console.log('records_fetch_events_for_map:', mapEventsObjectList);
      setMapEventsFullDay(mapEventsObjectList);

    }
  }, [loading, error, records]);


  useEffect(() => {
    const filteredEvents = map_events_full_day.filter(event => {
      const eventTimestamp = new Date(event.StartTimestamp);
      const startTime = new Date(`${findGameSelectedDate}T${findGameStartTime}`);
      const endTime = new Date(`${findGameSelectedDate}T${findGameEndTime}`);

      return eventTimestamp >= startTime && eventTimestamp <= endTime;
    });

    setMapEventsFiltered(filteredEvents);
  }, [findGameStartTime, findGameEndTime, map_events_full_day]);


  // Manage map popup
  const [activePopup, setActivePopup] = useState(null);
  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };

  const handleCreateGameSelectLocationClick = () => {
    setCreateGameLocation(mapRef.current.getCenter().toJSON());
    setIsCreateGameDateTimeModalVisible(!isCreateGameDateTimeModalVisible);
  };




  const logoutUser = () => {
    removeUserSession();
    setUserSession(null);
  };


  if (!googleMapsApiKey) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <>
      <LoadScript
        id="script-loader"
        googleMapsApiKey={googleMapsApiKey}
        language="en">
        <GoogleMap
          mapContainerStyle={map_styles.mapContainerStyle}
          zoom={15}
          center={mapCenter}
          draggable={true}
          onLoad={onLoad}
          options={{
            styles: [{
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            }],
          }}
        >
          {Array.isArray(map_events_filtered) &&
            map_events_filtered.map((event) => (
              <MapMarkerWithTooltip
                key={event.UUID}
                event={event}
                activePopup={activePopup}
                onSetActivePopup={handleSetActivePopup}
                userSession={userSession}
                onJoinGameButtonClick={run_attend_event}
                setEventUUID={setEventUUID}
                setIsInviteFriendsToEventModalVisible={setIsInviteFriendsToEventModalVisible}
              />
            ))}
        </GoogleMap>
        {isCreateGameMode && <img id="create-game-pin-marker" src={pinIcon} alt="Pin" style={map_styles.pinStyle} />}
        {isCreateGameMode && (
          <ButtonComponent id="create-game-datetime-button" onPress={handleCreateGameSelectLocationClick} title="Set Game Location" style={map_styles.bottomButtonStyle} />
        )}
        <CreateGameDateTimeModal
          isVisible={isCreateGameDateTimeModalVisible}
          onRequestClose={() => setIsCreateGameDateTimeModalVisible(false)}
          location={create_game_location}
          googleMapsApiKey={googleMapsApiKey}
          userSession={userSession}
          setEventUUID={setEventUUID}
          setIsCreateGameDateTimeModalVisible={setIsCreateGameDateTimeModalVisible}
          setIsInviteFriendsToEventModalVisible={setIsInviteFriendsToEventModalVisible}
          resetCreateGameDetails={resetCreateGameDetails}
          setIsCreateGameMode={setIsCreateGameMode}
        />
        <InviteFriendsToEventModal
          isVisible={isCreateGameInviteFriendsModalVisible}
          setIsInviteFriendsToEventModalVisible={setIsInviteFriendsToEventModalVisible}
          friendList={userSession.Friends}
          eventUUID={event_uuid}
          setEventUUID={setEventUUID}
          onRequestClose={() => setIsInviteFriendsToEventModalVisible(false)}
          userSession={userSession}
        />
      </LoadScript>
      <ButtonComponent
        title="Logout"
        onPress={() => logoutUser()}
        style={map_styles.logoutButtonStyle}
      />
      <ToastContainer />
    </>
  );
};


const map_styles = StyleSheet.create({
  mapContainerStyle: {
    flex: 1,
    width: '100%',
  },
  pinStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -100%)',
  },
  bottomButtonStyle: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    height: 50,
    width: '30%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2196F3',
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonStyle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '20%',
  }
});
