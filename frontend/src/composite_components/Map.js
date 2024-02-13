import React, { useState, useCallback, useRef, useEffect } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { ToastContainer } from 'react-toastify';

// import EventInfoWindow from './EventInfoWindow';

import { LoggerContext } from '../utils/Contexts';
import { defaultCenter, iconSvgObject } from '../utils/constants';
// import { useSetUserLocation } from '../utils/Hooks';


import { map_styles } from '../styles';


export default function Map({
  mapRef,
  map_events_filtered,
  ...props
}) {

  // const { logger, setLogger } = React.useContext(LoggerContext);
  const [visibleMarkers, setVisibleMarkers] = useState(map_events_filtered);
  const [infoWindowContent, setInfoWindowContent] = useState(null);
  const mapInstance = useRef(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [active_marker_event_data, setActiveMarkerEventData] = useState(null);

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
    mapRef.current = map;
  }, [mapRef]);

  // const onIdle = () => {
  //   debouncedUpdateVisibleMarkers();
  // };

  // useSetUserLocation(setMapCenter);
  // useEffect(() => {
  //   if (mapInstance.current) {
  //     debouncedUpdateVisibleMarkers();
  //   }
  // }, [map_events_filtered, debouncedUpdateVisibleMarkers]);


  // const handleActiveMarker = (selected_event_data) => {
  //   if (active_marker_event_data === null) {
  //     setActiveMarkerEventData(selected_event_data);
  //   } else if (selected_event_data.UUID === active_marker_event_data.UUID) {
  //     setActiveMarkerEventData(null);
  //   } else {
  //     setActiveMarkerEventData(selected_event_data);
  //   }
  // };

  return (
    <>
      <Box id="box-main-map" sx={map_styles.main_map_box}>
        <GoogleMap
          mapContainerStyle={map_styles.mapContainerStyle}
          zoom={15}
          center={mapCenter}
          onLoad={onLoad}
          // onIdle={onIdle}
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
          {/* {
            visibleMarkers.map(event => (
              <Marker
                key={event.UUID}
                position={{ lat: event.Lat, lng: event.Lon }}
                onClick={() => handleActiveMarker(event)}
                icon={{
                  ...iconSvgObject(event.PinColor),
                  anchor: new google.maps.Point(11.5, 16)
                }}
              />
            ))
          } */}
          {/* {active_marker_event_data && (
            <EventInfoWindow
              active_marker_event_data={active_marker_event_data}
              setActiveMarkerEventData={setActiveMarkerEventData}
              {...props}
            />
          )} */}
        </GoogleMap>
      </Box>
    </>
  );
}
