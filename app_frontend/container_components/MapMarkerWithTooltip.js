import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import moment from 'moment';

import { Marker, InfoWindow } from '@react-google-maps/api';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import '../css/custom-infowindow.css';
import styles from '../styles';

const MapMarkerWithTooltip = ({
  event,
  activePopup,
  onSetActivePopup,
  userSession,
  onJoinGameButtonClick,
  setEventUUID,
  setIsInviteFriendsToEventModalVisible,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

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
    onSetActivePopup(event.UUID);
  };

  const handleJoinGameButtonClick = (eventUUID) => {
    console.log('handleJoinGameButtonClick', eventUUID);
    onJoinGameButtonClick({
      attendee_uuid: userSession.UUID,
      event_uuid: eventUUID,
    });
    setEventUUID(eventUUID);
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
            {/* <tr>
              <td style={tooltipStyles.label}>Players:</td>
              <td style={tooltipStyles.value}>
                {event.AttendeeCount.toNumber()}
              </td>
            </tr> */}
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
    >
      {showTooltip && (
        <InfoWindow>
          <View style={tooltipStyles.container}>{renderInfoContent()}</View>
        </InfoWindow>
      )}
      {activePopup === event.UUID && (
        <InfoWindow onCloseClick={handleMarkerClick}>
          <div style={tooltipStyles.container}>
            {renderInfoContent()}
            <div>
              <ButtonComponent
                onPress={() => handleJoinGameButtonClick(event.UUID)}
                title="Join Game"
                style={tooltipStyles.buttonStyle}
              />
            </div>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
};

const tooltipStyles = {
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
    marginRight: '4px',
    padding: '2px 10px 2px 0',
    textAlign: 'right',
  },
  value: {
    padding: '2px 0',
  },
  buttonStyle: {
    backgroundColor: '#2196F3',
  },
  infoWindowStyle: {
    padding: 0,
    margin: 0,
  },
};

export default MapMarkerWithTooltip;
