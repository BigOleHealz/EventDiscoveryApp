import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useReadCypher } from 'use-neo4j';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { day_start_time, day_end_time } from '../utils/constants';
import { getAddressFromCoordinates, convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { removeUserSession } from '../utils/SessionManager';
import pinIcon from '../assets/pin.png';

export const Map = ({
  findGameSelectedDate,
  findGameStartTime,
  findGameEndTime,
  eventTypesSelected
}) => {
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);

  // Start logging
  logger.info("Map component is initializing...");

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };

  const [event_uuid, setEventUUID] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [createGameData, setCreateGameData] = useState({});

  const [ isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible ] = useState(false);
  const [ isSelectEventTypeModalVisible, setIsSelectEventTypeModalVisible ] = useState(false);
  const [ isCreateGameInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);
  const [ isCreateEventDetailsModalVisible, setIsCreateEventDetailsModalVisible ] = useState(false);


  const [transactionStatus, setTransactionStatus] = useState(false);


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
    logger.info('findGameSelectedDate changed', findGameSelectedDate);
    const params = {
      account_uuid: userSession.UUID,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp,
    };
    logger.info('params:', params);
    run(params);
  }, [findGameSelectedDate, event_uuid, transactionStatus === false]);

  useEffect(() => {
    if (!loading && !error && records) {
      const mapEventsObjectList = recordsAsObjects(records);
      logger.info('records_fetch_events_for_map:', mapEventsObjectList);
      setMapEventsFullDay(mapEventsObjectList);
    }
  }, [loading, error, records]);

  useEffect(() => {
    const start_time_raw_string = `${findGameSelectedDate}T${findGameStartTime}`
    const end_time_raw_string = `${findGameSelectedDate}T${findGameEndTime}`
    logger.info(`Datetime changed - startTime: ${start_time_raw_string} endTime: ${end_time_raw_string}`);
    const startTime = new Date(start_time_raw_string);
    const endTime = new Date(end_time_raw_string);

    const filteredEvents = map_events_full_day.filter((event) => {
      const eventTimestamp = new Date(event.StartTimestamp);
      return (
        eventTimestamp >= startTime &&
        eventTimestamp <= endTime
        // &&
        // eventTypesSelected.includes(event.EventTypeUUID)
      );
    });
    
    logger.info('filteredEvents:', filteredEvents)
    setMapEventsFiltered(filteredEvents);
  }, [findGameStartTime, findGameEndTime, map_events_full_day, eventTypesSelected]);



  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };


  const logoutUser = () => {
    logger.info("User logging out...");
    removeUserSession();
    setUserSession(null);
  };

  if (!googleMapsApiKey) {
    logger.warning("Google Maps API key not found, rendering loading screen...");
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  logger.info("Rendering Map component...");

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
                setEventUUID={setEventUUID}
              />
            ))}
        </GoogleMap>
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
