import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useReadCypher } from 'use-neo4j';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CreateGameDateTimeModal, SelectEventTypeModal, InviteFriendsToEventModal, CreateEventDetailsModal } from './Modals';
import { ButtonComponent } from '../base_components/ButtonComponent';
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { CreateGameContext } from '../utils/Contexts';
import { recordsAsObjects } from '../db/DBHandler';
import {
  FETCH_EVENTS_FOR_MAP,
  CREATE_ATTEND_EVENT_RELATIONSHIP,
} from '../db/queries';
import { useCustomCypherWrite } from '../hooks/CustomCypherHooks';
import { getSecretValue } from '../utils/AWSHandler';
import { UserSessionContext } from '../utils/Contexts';
import { day_start_time, day_end_time } from '../utils/constants';
import { getAddressFromCoordinates, convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { removeUserSession } from '../utils/SessionManager';
import pinIcon from '../assets/pin.png';

export const Map = ({
  isCreateGameMode,
  setIsCreateGameMode,
  findGameSelectedDate,
  findGameStartTime,
  findGameEndTime,
  eventTypesSelected
}) => {
	const { userSession, setUserSession } = React.useContext(UserSessionContext);
  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };

  const [event_uuid, setEventUUID] = useState(null);
  const [createGameData, setCreateGameData] = useState({});

  const [ isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible ] = useState(false);
  const [ isSelectEventTypeModalVisible, setIsSelectEventTypeModalVisible ] = useState(false);
  const [ isCreateGameInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);
  const [ isCreateEventDetailsModalVisible, setIsCreateEventDetailsModalVisible ] = useState(false);


  const [transactionStatus, setTransactionStatus] = useState(false);

  const {
    transactionStatus: attend_event_status,
    executeQuery: run_attend_event,
    resetTransactionStatus: reset_attend_event_transaction_status,
  } = useCustomCypherWrite(CREATE_ATTEND_EVENT_RELATIONSHIP);

  useEffect(() => {
    if (attend_event_status.STATUS === 'ERROR') {
      toast.error(`Error Creating Account: ${attend_event_status.RESPONSE}`);
      console.log(attend_event_status.RESPONSE);
      reset_attend_event_transaction_status();
    } else if (attend_event_status.STATUS === 'SUCCESS') {
      toast.success("You RSVP'd to this event!");
      reset_attend_event_transaction_status();
      setIsInviteFriendsToEventModalVisible(true);
    }
  }, [attend_event_status]);

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

  const start_timestamp = convertUTCDateToLocalDate(new Date(`${findGameSelectedDate}T${day_start_time}`));
  const end_timestamp = convertUTCDateToLocalDate(new Date(`${findGameSelectedDate}T${day_end_time}`));

  const { loading, error, records, run } = useReadCypher(FETCH_EVENTS_FOR_MAP);

  useEffect(() => {
    console.log('findGameSelectedDate changed', findGameSelectedDate);
    const params = {
      account_uuid: userSession.UUID,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp,
    };
    console.log('params:', params);
    run(params);
  }, [findGameSelectedDate, event_uuid, transactionStatus === false]);

  useEffect(() => {
    if (!loading && !error && records) {
      const mapEventsObjectList = recordsAsObjects(records);
      console.log('records_fetch_events_for_map:', mapEventsObjectList);
      setMapEventsFullDay(mapEventsObjectList);
    }
  }, [loading, error, records]);

  useEffect(() => {
    const filteredEvents = map_events_full_day.filter((event) => {
      const eventTimestamp = new Date(event.StartTimestamp);
      const startTime = new Date(`${findGameSelectedDate}T${findGameStartTime}`);
      const endTime = new Date(`${findGameSelectedDate}T${findGameEndTime}`);

      console.log('start_timestamp:', start_timestamp)
      console.log('end_timestamp:', end_timestamp)
  
      return (
        eventTimestamp >= startTime &&
        eventTimestamp <= endTime
        // &&
        // eventTypesSelected.includes(event.EventTypeUUID)
      );
    });
    
    console.log('filteredEvents:', filteredEvents)
    setMapEventsFiltered(filteredEvents);
  }, [findGameStartTime, findGameEndTime, map_events_full_day, eventTypesSelected]);

  const [activePopup, setActivePopup] = useState(null);
  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };

  const handleCreateGameSelectLocationClick = async () => {
    const location_selected = mapRef.current.getCenter().toJSON()
    console.log('location_selected:', location_selected);
    const lat = location_selected.lat;
    const lon = location_selected.lng;
    const address = await getAddressFromCoordinates(lat, lon, googleMapsApiKey);
    
    setCreateGameData({"Address": address, "Lat": lat, "Lon": lon});
    console.log('createGameData:', createGameData);
    setIsCreateGameDateTimeModalVisible(!isCreateGameDateTimeModalVisible);
  };

  const exitCreateGameMode = () => {
    setIsCreateGameMode(false);
    setCreateGameData({});
    setIsCreateGameDateTimeModalVisible(false);
    setIsSelectEventTypeModalVisible(false);
    setIsInviteFriendsToEventModalVisible(false);
    setIsCreateEventDetailsModalVisible(false);
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
    );
  }

  return (
    <>
      <LoadScript
        id="script-loader"
        googleMapsApiKey={googleMapsApiKey}
        language="en"
      >
        <GoogleMap
          mapContainerStyle={map_styles.mapContainerStyle}
          zoom={15}
          center={mapCenter}
          draggable={true}
          onLoad={onLoad}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
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
                setIsInviteFriendsToEventModalVisible={
                  setIsInviteFriendsToEventModalVisible
                }
              />
            ))}
        </GoogleMap>
        <CreateGameContext.Provider value={{ createGameData: createGameData, setCreateGameData }}>
          {isCreateGameMode && (
            <>
              <img
                id="create-game-pin-marker"
                src={pinIcon}
                alt="Pin"
                style={map_styles.pinStyle}
              />
              <ButtonComponent
                id="create-game-location-button"
                onPress={handleCreateGameSelectLocationClick}
                title="Set Game Location"
                style={map_styles.bottomButtonStyle}
              />
            </>
          )}
          <CreateGameDateTimeModal
            isVisible={isCreateGameDateTimeModalVisible}
            setIsCreateGameDateTimeModalVisible={setIsCreateGameDateTimeModalVisible}
            setIsSelectEventTypeModalVisible={setIsSelectEventTypeModalVisible}
            onRequestClose={exitCreateGameMode}
          />
          <SelectEventTypeModal
            isVisible={isSelectEventTypeModalVisible}
            setIsSelectEventTypeModalVisible={setIsSelectEventTypeModalVisible}
            setIsInviteFriendsToEventModalVisible={setIsInviteFriendsToEventModalVisible}
            onRequestClose={exitCreateGameMode}
          />
          <InviteFriendsToEventModal
            isVisible={isCreateGameInviteFriendsModalVisible}
            setIsInviteFriendsToEventModalVisible={setIsInviteFriendsToEventModalVisible}
            setIsCreateEventDetailsModalVisible={setIsCreateEventDetailsModalVisible}
            onRequestClose={exitCreateGameMode}
            isCreateGameMode={isCreateGameMode}
            event_uuid={event_uuid}
          />
          <CreateEventDetailsModal
            isVisible={isCreateEventDetailsModalVisible}
            setIsCreateEventDetailsModalVisible={setIsCreateEventDetailsModalVisible}
            onRequestClose={exitCreateGameMode}
          />
        </CreateGameContext.Provider>
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

const buttonHeight = 50;
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
    height: buttonHeight,
    width: '30%',
    transform: 'translateX(-50%)',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonStyle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '20%',
    height: buttonHeight,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
