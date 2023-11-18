import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { InfoWindow, Marker } from '@react-google-maps/api';
import { AttendEventWorkflow } from './AttendEventWorkflow';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import { EventViewerModal } from './Modals';

import { icon_size, iconSvgObject } from '../utils/constants'

import { common_styles, tooltip_styles } from '../styles';

const MapMarkerWithTooltip = ({
  event,
  activePopup,
  onSetActivePopup,
  setAttendEventCurrentlyActiveData,
  clusterer
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  // const { logger, setLogger } = React.useContext(LoggerContext);
  const icon = iconSvgObject(event.PinColor);

  const position = { lat: event.Lat, lng: event.Lon };

  const [attend_event_stage, setAttendEventStage] = useState(0);

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
    // logger.info(`Marker clicked for event: ${event.UUID}\nEvent Name: ${event.EventName}`);
    console.log(`Marker clicked for event: ${event.UUID}\nEvent Name: ${event.EventName}`);
    onSetActivePopup(event.UUID);
  };

  const viewEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...event,
      attending_stage: 1
    })
    setAttendEventStage(1);
  }


  const renderInfoContent = () => {
    return (
      <Box style={tooltip_styles.container}>
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
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={viewEventButtonClick}
          style={tooltip_styles.buttonStyle}
        >
          View Event
        </Button>
      </Box>
    );
  };

  return (
    <>
      <Marker
        position={position}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={handleMarkerClick}
        icon={icon}
      // clusterer={clusterer}
      >
        {showTooltip && (
          <InfoWindow position={position} onCloseClick={handleMarkerClick}>
            <Box style={tooltip_styles.container}>{renderInfoContent()}</Box>
          </InfoWindow>
        )}
        {activePopup === event.UUID && (
          <InfoWindow position={position} onCloseClick={handleMarkerClick}>
            <Box style={tooltip_styles.container}>{renderInfoContent()}</Box>
          </InfoWindow>
        )}
      </Marker>

    </>
  );
};

export default MapMarkerWithTooltip;
