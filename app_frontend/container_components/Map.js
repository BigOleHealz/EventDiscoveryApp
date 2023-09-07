import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ButtonComponent } from '../base_components/ButtonComponent';
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { CreateGameContext, LoggerContext, UserSessionContext } from '../utils/Contexts';
import { day_start_time, day_end_time } from '../utils/constants';
import { convertUTCDateToLocalDate, getAddressFromCoordinates, getUserLocation } from '../utils/HelperFunctions';

import { removeUserSession } from '../utils/SessionManager';
import pinIcon from '../assets/pin.png';

import { map_styles } from '../styles';

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

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null); // Add this state to store the API key

  const [event_uuid, setEventUUID] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [createGameData, setCreateGameData] = useState({});
  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [fetching_events, setFetchingEvents] = useState(false);

  const [ isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible ] = useState(false);
  const [ isSelectEventTypeModalVisible, setIsSelectEventTypeModalVisible ] = useState(false);
  const [ isCreateGameInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);
  const [ isCreateEventDetailsModalVisible, setIsCreateEventDetailsModalVisible ] = useState(false);


  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (fetching_google_maps_api_key) {
      fetch('/api/get_aws_secret', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            secret_id: 'google_maps_api_key',
        }),
      }).then(res => res.json())
      .then(data => {
          if (data) {
            setGoogleMapsApiKey(data.GOOGLE_MAPS_API_KEY);
          }
      }).catch((error) => {
          console.error('Error:', error);
      });

      setFetchingGoogleMapsApiKey(false);
      setFetchingEvents(true);
    }
  }, [fetching_google_maps_api_key]);
  
  const mapRef = React.useRef();

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({
          lat: latitude,
          lng: longitude
        });
      },
      (error) => {
        console.error("Error getting user's location:", error);
        toast.error("Error fetching your location. Defaulting to Philadelphia.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // Handle Map Events
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);
  const start_timestamp = convertUTCDateToLocalDate(new Date(`${findGameSelectedDate}T${day_start_time}`));
  const end_timestamp = convertUTCDateToLocalDate(new Date(`${findGameSelectedDate}T${day_end_time}`));

  useEffect(() => {
    if (fetching_events) {

      fetch('/api/events', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              start_timestamp: start_timestamp,
              end_timestamp: end_timestamp,
          }),
      }).then(res => res.json())
      .then(data => {
          setMapEventsFullDay(data);
      }).catch((error) => {
          console.error('Error:', error);
      });

      setFetchingEvents(false);
    }
  }, [fetching_events, start_timestamp, end_timestamp]);

  console.debug('map_events_full_day:', map_events_full_day);
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
        eventTimestamp <= endTime &&
        eventTypesSelected.includes(event.EventTypeUUID)
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

  useEffect(() => {
    setFetchingEvents(true);
  }, [findGameSelectedDate]);


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
          zoom={10}
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
