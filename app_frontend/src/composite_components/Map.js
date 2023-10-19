import React, { useState, useEffect, useRef, useContext } from 'react';
import Container from "@mui/material/Container";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';

import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { day_start_time, day_end_time, defaultCenter } from '../utils/constants';
import { useFetchEvents, useFetchGoogleMapsApiKey, useFilterEvents, useSetUserLocation } from '../utils/Hooks';


import { map_styles } from '../styles';

export default function Map({
  mapRef,
  google_maps_api_key,
  map_events_filtered,
  // ...props
}) {
  // const { logger, setLogger } = React.useContext(LoggerContext);

  // Start logging
  // logger.info("Map component is initializing...");

  // Handle Map Events
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [activePopup, setActivePopup] = useState(null);

  useSetUserLocation(setMapCenter);
  const onLoad = (map) => {
    mapRef.current = map;
  };

  // console.log('map_events_filtered = ', map_events_filtered)

  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };

  if (!google_maps_api_key) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <LoadScript
        id="script-loader"
        googleMapsApiKey={google_maps_api_key}
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

    </>
  );
};
