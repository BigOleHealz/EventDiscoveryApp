import React, { useState, useEffect  } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { ButtonComponent } from '../base_components/ButtonComponent';
import '../css/custom-infowindow.css';
import styles from '../styles';

const MapMarkerWithTooltip = ({ event, activePopup, onSetActivePopup, onJoinGameButtonClick }) => {

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

  const handleJoinGameButtonClick = () => {
    onJoinGameButtonClick(event.UUID);
  };

  const renderInfoContent = () => {
    return (
      <>
        <div style={tooltipStyles.container}>
          <div style={tooltipStyles.address}>{event.Address}</div>
          <table style={tooltipStyles.table}>
            <tbody>
              <tr>
                <td style={tooltipStyles.label}>Starts At:</td>
                <td style={tooltipStyles.value}>{event.FormattedStart}</td>
              </tr>
              <tr>
                <td style={tooltipStyles.label}>Players:</td>
                <td style={tooltipStyles.value}>{event.AttendeeCount.toNumber()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
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
        <div className="gm-style-iw">
          <div style={tooltipStyles.container}>
            {renderInfoContent()}

          </div>
        </div>
        </InfoWindow>
      )}
      {activePopup === event.UUID && (
        <InfoWindow onCloseClick={handleMarkerClick}>
          <div className="gm-style-iw">
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
    padding: '8px', // Add padding for better appearance
    borderRadius: '4px', // Add border radius for a smoother look
    margin: '0px',
  },
  table: {
    margin: 10,
    borderCollapse: 'collapse',
    width: '100%',
  },
  address: {
    fontWeight: 'bold',
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
    backgroundColor: '#2196F3'
  }
};


export default MapMarkerWithTooltip;
