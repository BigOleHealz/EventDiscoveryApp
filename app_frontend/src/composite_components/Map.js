import React, { useState, useCallback, useRef, useEffect } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleMap, MarkerClusterer } from '@react-google-maps/api';

import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { LoggerContext } from '../utils/Contexts';
import { defaultCenter } from '../utils/constants';
import { useSetUserLocation } from '../utils/Hooks';


import { map_styles } from '../styles';

export default function Map({
  mapRef,
  map_events_filtered,
  ...props
}) {
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const mapInstance = useRef(null); // To store the actual Google Map instance

  // Use useCallback to memoize the function
  const updateVisibleMarkers = useCallback(() => {
    if (!mapInstance.current) return;

    const bounds = mapInstance.current.getBounds();
    const visibleEvents = map_events_filtered.filter(event =>
      bounds.contains(new window.google.maps.LatLng(event.Lat, event.Lon))
    );

    setVisibleMarkers(visibleEvents);
  }, [map_events_filtered]);

  // Debounce the update function
  const debouncedUpdateVisibleMarkers = useCallback(
    _.debounce(updateVisibleMarkers, 300),
    [updateVisibleMarkers]
  );

  const onLoad = useCallback((map) => {
    mapInstance.current = map;
    mapRef.current = map; // Assuming you still need this for other purposes
  }, [mapRef]);

  const onIdle = () => {
    debouncedUpdateVisibleMarkers();
  };

  // Handle Map Events
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [activePopup, setActivePopup] = useState(null);


  useSetUserLocation(setMapCenter);

  const handleSetActivePopup = (uuid) => {
    if (activePopup === uuid) {
      setActivePopup(null);
    } else {
      setActivePopup(uuid);
    }
  };

  useEffect(() => {
    if (mapInstance.current) {
      debouncedUpdateVisibleMarkers();
    }
  }, [map_events_filtered, debouncedUpdateVisibleMarkers]);

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
        onLoad={onLoad}
        onIdle={onIdle}
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
        {
          Array.isArray(visibleMarkers) && visibleMarkers.map(event => (
            <MapMarkerWithTooltip
              key={event.UUID}
              event={event}
              activePopup={activePopup}
              onSetActivePopup={handleSetActivePopup}
              {...props}
            />
          ))
        }
      </GoogleMap>
    </Box>
  );
};