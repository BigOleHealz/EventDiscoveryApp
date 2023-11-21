import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, MarkerClusterer } from '@react-google-maps/api';

import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { defaultCenter } from '../utils/constants';
import { useSetUserLocation } from '../utils/Hooks';
import { removeUserSession } from '../utils/SessionManager';


import { map_styles } from '../styles';

export default function Map({
  mapRef,
  map_events_filtered,
  ...props
}) {
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const { user_session, setUserSession } = React.useContext(UserSessionContext);

  // Handle Map Events
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [activePopup, setActivePopup] = useState(null);


  useSetUserLocation(setMapCenter);
  const onLoad = (map) => {
    mapRef.current = map;
  };

  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };
  return (
    <Box id="box-main-map"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <ToastContainer />
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
              {...props}
            // clusterer={clusterer}
            />
          ))
        }
        {/* </MarkerClusterer> */}
      </GoogleMap>
    </Box>
  );
};
