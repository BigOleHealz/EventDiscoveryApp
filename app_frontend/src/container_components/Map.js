import React, { useState, useEffect, useRef, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';

import { ButtonComponent } from '../base_components/ButtonComponent'; // Assuming you also have a web version of this
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { day_start_time, day_end_time, defaultCenter } from '../utils/constants';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { setUserLocation, useFetchEvents, useFetchGoogleMapsApiKey, useFilterEvents, useSetUserLocation } from '../utils/Hooks';

import { removeUserSession } from '../utils/SessionManager';

import { map_styles } from '../styles';

export const Map = ({
  mapRef,
  googleMapsApiKey,
  fetching_events,
  setFetchingEvents,
  findEventSelectedDate,
  findEventStartTime,
  findEventEndTime,
  eventTypesSelected
}) => {
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const { logger, setLogger } = React.useContext(LoggerContext);

  // Start logging
  logger.info("Map component is initializing...");

  // Handle Map Events
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [map_events_full_day, setMapEventsFullDay] = useState([]);
  const [map_events_filtered, setMapEventsFiltered] = useState([]);

  const [activePopup, setActivePopup] = useState(null);

  const start_timestamp = convertUTCDateToLocalDate(new Date(`${findEventSelectedDate}T${day_start_time}`));
  const end_timestamp = convertUTCDateToLocalDate(new Date(`${findEventSelectedDate}T${day_end_time}`));

  useSetUserLocation(setMapCenter);
  useFetchEvents(fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setFetchingEvents);
  useFilterEvents(findEventSelectedDate, findEventStartTime, findEventEndTime, map_events_full_day, eventTypesSelected, setMapEventsFiltered, logger);
  
  const onLoad = (map) => {
    mapRef.current = map;
  };

  console.debug('map_events_full_day:', map_events_full_day);

  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };

  useEffect(() => {
    setFetchingEvents(true);
  }, [findEventSelectedDate]);

  const logoutUser = () => {
    logger.info("User logging out...");
    removeUserSession(setUserSession);
  };


  if (!googleMapsApiKey) {
    logger.warning("Google Maps API key not found, rendering loading screen...");
    return (
      <div>
        <p>Loading...</p>
      </div>
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
       
          {/* <MarkerClusterer
            options={{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }}
            maxZoom={20}
          > */}
            {
              // (clusterer) => (
                Array.isArray(map_events_filtered) && map_events_filtered.map((event) => (
                  <MapMarkerWithTooltip
                    key={event.UUID}
                    event={event}
                    activePopup={activePopup}
                    onSetActivePopup={handleSetActivePopup}
                    // Removed clusterer prop
                  />
                ))
              // )
            }
          {/* </MarkerClusterer> */}


        </GoogleMap>
      </LoadScript>
    
      <ButtonComponent
        id="button-logout"
        title="Logout"
        onPress={() => logoutUser()}
        style={map_styles.logoutButtonStyle}
      />

      <ToastContainer />
    </>
  );
};
