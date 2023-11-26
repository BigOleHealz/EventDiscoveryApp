import React, { useState, useCallback, useRef, useEffect } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { LoggerContext } from '../utils/Contexts';
import { defaultCenter, iconSvgObject } from '../utils/constants';
import { useSetUserLocation } from '../utils/Hooks';


import { map_styles } from '../styles';

export default function Map({
  mapRef,
  map_events_filtered,
  ...props
}) {
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const mapInstance = useRef(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);


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


  useSetUserLocation(setMapCenter);

  useEffect(() => {
    if (mapInstance.current) {
      debouncedUpdateVisibleMarkers();
    }
  }, [map_events_filtered, debouncedUpdateVisibleMarkers]);


  const [activeMarker, setActiveMarker] = useState(null);
  const handleActiveMarker = (uuid) => {
    setActiveMarker(activeMarker === uuid ? null : uuid);
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
          map_events_filtered.map(event => (
            <Marker
              key={event.UUID}
              position={{ lat: event.Lat, lng: event.Lon }}
              onClick={() => handleActiveMarker(event.UUID)}
              icon={{
                ...iconSvgObject(event.PinColor),
                anchor: new google.maps.Point(11.5, 16)
              }}
            >
              {activeMarker === event.UUID && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <Box style={{ padding: '8px' }}>
                    <div>{event.EventName}</div>
                    {/* You can add more event details here */}
                  </Box>
                </InfoWindow>
              )}
            </Marker>
          ))
        }
      </GoogleMap>
    </Box>
  );
}