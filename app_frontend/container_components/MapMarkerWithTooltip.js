import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';

import { Marker, InfoWindow } from '@react-google-maps/api';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { LoggerContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { event_types_icon_map } from '../utils/constants'

import styles from '../styles';

const MapMarkerWithTooltip = ({
  event,
  activePopup,
  onSetActivePopup,
  setEventUUID,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const { logger, setLogger } = React.useContext(LoggerContext);

  const position = { lat: event.Lat, lng: event.Lon };
  const icon_size = 50;

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
      <View style={tooltipStyles.container}>
        <div style={tooltipStyles.address}>{event.Address}</div>
        <table style={tooltipStyles.table}>
          <tbody>
            <tr>
              <td style={tooltipStyles.label}>Name:</td>
              <td style={tooltipStyles.value}>{event.EventName}</td>
            </tr>
            <tr>
              <td style={tooltipStyles.label}>Starts At:</td>
              <td style={tooltipStyles.value}>{moment(convertUTCDateToLocalDate(event.StartTimestamp)).format('hh:mm a')}</td>
            </tr>
            <tr>
              <td style={tooltipStyles.label}>Ends At:</td>
              <td style={tooltipStyles.value}>{moment(convertUTCDateToLocalDate(event.EndTimestamp)).format('hh:mm a')}</td>
            </tr>
            <tr>
              <td style={tooltipStyles.label}>Event Type:</td>
              <td style={tooltipStyles.value}>{event.EventType}</td>
            </tr>
            {event.Price && (
              <tr>
                <td style={tooltipStyles.label}>Price:</td>
                <td style={tooltipStyles.value}>{event.Price}</td>
              </tr>
            )}
            {event.EventURL && (
              <tr>
                <td style={tooltipStyles.label}>Event URL:</td>
                <td style={tooltipStyles.value}>
                  <a href={event.EventURL} target="_blank" rel="noopener noreferrer" style={styles.hyperlinkText}>
                    {event.EventURL}
                  </a>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </View>
    );
  };

  return (
    <Marker
      position={position}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleMarkerClick}
      icon={
        event_types_icon_map.hasOwnProperty(event.EventType)
          ? {
              url: event_types_icon_map[event.EventType],
              scaledSize: {
                height: icon_size, // Set the desired height
                width: icon_size, // Calculate the width based on the desired height and the aspect ratio
              },
            }
          : undefined
      }
    >
      {showTooltip && (
        <InfoWindow position={position} onCloseClick={handleMarkerClick}>
          <View style={tooltipStyles.container}>{renderInfoContent()}</View>
        </InfoWindow>
      )}
      {activePopup === event.UUID && (
        <InfoWindow position={position} onCloseClick={handleMarkerClick}>
          <View style={tooltipStyles.container}>{renderInfoContent()}</View>
        </InfoWindow>
      )}
    </Marker>
  );
};

const tooltipStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#222', // Dark background color
    color: '#fff', // Light text color
    padding: 10, // Add padding for better appearance
    borderRadius: '4px', // Add border radius for a smoother look
    margin: 0,
  },
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    width: '100%',
  },
  address: {
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
  },
  label: {
    width: '30%',
    fontWeight: '600',
    marginRight: 4,
    paddingLeft: 4,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: 'right',
  },
  value: {
    padding: 2,
  },
  buttonStyle: {
    backgroundColor: '#2196F3',
  },
  infoWindowStyle: {
    padding: 0,
    margin: 0,
  },
});

export default MapMarkerWithTooltip;
