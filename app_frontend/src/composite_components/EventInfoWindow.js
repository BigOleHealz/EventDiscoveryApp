// EventInfoWindow.js

import React, { useState } from 'react';
import moment from 'moment';
import { InfoWindow } from '@react-google-maps/api';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { tooltip_styles } from '../styles';

const EventInfoWindow = ({
  active_marker_event_data,
  setActiveMarkerEventData,
  setAttendEventCurrentlyActiveData
}) => {


  const viewEventButtonClick = () => {
    setAttendEventCurrentlyActiveData({
      ...active_marker_event_data,
      attending_stage: 1
    })
  }

  return (
    <InfoWindow
      position={{ lat: active_marker_event_data.Lat, lng: active_marker_event_data.Lon }}
      onCloseClick={() => setActiveMarkerEventData(null)}
      options={{ pixelOffset: new window.google.maps.Size(0, -22) }}
    >
      <Box style={tooltip_styles.container}>
        <Box style={tooltip_styles.title}>{active_marker_event_data.EventName}</Box>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={tooltip_styles.label}>Address:</TableCell>
                <TableCell style={tooltip_styles.value}>{active_marker_event_data.Address}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={tooltip_styles.label}>Time:</TableCell>
                <TableCell style={tooltip_styles.value}>{moment(convertUTCDateToLocalDate(active_marker_event_data.StartTimestamp)).format('hh:mm a')} - {moment(convertUTCDateToLocalDate(active_marker_event_data.EndTimestamp)).format('hh:mm a')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={tooltip_styles.label}>Event Type:</TableCell>
                <TableCell style={tooltip_styles.value}>{active_marker_event_data.EventType}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={tooltip_styles.label}>Attendees:</TableCell>
                <TableCell style={tooltip_styles.value}>{active_marker_event_data.AttendeeCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={tooltip_styles.label}>Price:</TableCell>
                <TableCell style={tooltip_styles.value}>{active_marker_event_data.Price}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

        </TableContainer>
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
    </InfoWindow>
  );
};

export default EventInfoWindow;
