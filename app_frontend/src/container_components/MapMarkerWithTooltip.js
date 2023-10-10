import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';

import { InfoWindow, Marker } from '@react-google-maps/api';
import { ButtonComponent } from '../base_components/ButtonComponent'; // Assuming you also have a web version of this
import { LoggerContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { event_types_icon_map, icon_size } from '../utils/constants'
import '../css/custom-infowindow.css';

import { common_styles, tooltip_styles } from '../styles';

const MapMarkerWithTooltip = ({
  event,
  activePopup,
  onSetActivePopup,
  clusterer
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { logger, setLogger } = React.useContext(LoggerContext);

  const position = { lat: event.Lat, lng: event.Lon };

  useEffect(() => {
    if (activePopup === event.UUID) {
      setShowTooltip(false);
    }
  }, [activePopup, event.UUID]);

  const handleMouseOver = () => {
    setShowTooltip(true);
  };

  const handleMouseOut = () => {
    setShowTooltip(false);
  };

  const handleMarkerClick = () => {
    logger.info(`Marker clicked for event: ${event.UUID}\nEvent Name: ${event.EventName}`);
    onSetActivePopup(event.UUID);
  };


  const renderInfoContent = () => {
    return (
      <div style={tooltip_styles.container}>
        <div style={tooltip_styles.title}>{event.EventName}</div>
        <table style={tooltip_styles.table}>
          <tbody>
            <tr>
              <td style={tooltip_styles.label}>Address:</td>
              <td style={tooltip_styles.value}>{event.Address}</td>
            </tr>
            <tr>
              <td style={tooltip_styles.label}>Time:</td>
              <td style={tooltip_styles.value}>{moment(convertUTCDateToLocalDate(event.StartTimestamp)).format('hh:mm a')} - {moment(convertUTCDateToLocalDate(event.EndTimestamp)).format('hh:mm a')}</td>
            </tr>
            <tr>
              <td style={tooltip_styles.label}>Event Type:</td>
              <td style={tooltip_styles.value}>{event.EventType}</td>
            </tr>
            {event.Price && (
              <tr>
                <td style={tooltip_styles.label}>Price:</td>
                <td style={tooltip_styles.value}>{event.Price}</td>
              </tr>
            )}
            {event.EventURL && (
              <tr>
                <td style={tooltip_styles.label}>Event URL:</td>
                <td style={tooltip_styles.value}>
                  <a href={event.EventURL} target="_blank" rel="noopener noreferrer" style={common_styles.hyperlinkText}>
                    {event.EventURL}
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <Marker
      position={position}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleMarkerClick}
      // icon={
      //   event_types_icon_map && event_types_icon_map.hasOwnProperty(event.EventType)
      //     ? {
      //         url: event_types_icon_map[event.EventType],
      //         scaledSize: icon_size
      //       }
      //     : undefined
      // }
      clusterer={clusterer}
    >
      {showTooltip && (
        <InfoWindow position={position} onCloseClick={handleMarkerClick}>
          <div style={tooltip_styles.container}>{renderInfoContent()}</div>
        </InfoWindow>
      )}
      {activePopup === event.UUID && (
        <InfoWindow position={position} onCloseClick={handleMarkerClick}>
          <div style={tooltip_styles.container}>{renderInfoContent()}</div>
        </InfoWindow>
      )}
    </Marker>
  );

};

export default MapMarkerWithTooltip;
