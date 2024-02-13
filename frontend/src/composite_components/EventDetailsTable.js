import React from 'react';
import moment from 'moment';
import { Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';

import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';

import { event_details_display_styles } from '../styles';

const EventDetailsTable = ({
  event
}) => {
  return (
    <Box style={event_details_display_styles.container}>
      <Box style={event_details_display_styles.title}>{event.EventName}</Box>
      <TableContainer component={Paper}>
        <Table style={event_details_display_styles.table}>
          <TableBody style={event_details_display_styles.body}>
            <TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Address:</TableCell>
              <TableCell style={event_details_display_styles.value}>{event.Address}</TableCell>
            </TableRow>
            <TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Created By:</TableCell>
              <TableCell style={event_details_display_styles.value}>{event.CreatedByUsername}</TableCell>
            </TableRow>
            <TableRow TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Date:</TableCell>
              <TableCell style={event_details_display_styles.value}>{moment(convertUTCDateToLocalDate(event.StartTimestamp)).format('ddd MMM D, YYYY')}</TableCell>
            </TableRow>
            <TableRow TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Time:</TableCell>
              <TableCell style={event_details_display_styles.value}>{moment(convertUTCDateToLocalDate(event.StartTimestamp)).format('hh:mm a')} - {moment(convertUTCDateToLocalDate(event.EndTimestamp)).format('hh:mm a')}</TableCell>
            </TableRow>
            <TableRow TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Event Type:</TableCell>
              <TableCell style={event_details_display_styles.value}>{event.EventType}</TableCell>
            </TableRow>

            <TableRow TableRow style={event_details_display_styles.row}>
              <TableCell style={event_details_display_styles.label}>Description:</TableCell>
              <TableCell style={event_details_display_styles.value}>{event.EventDescription}</TableCell>
            </TableRow>

            {event.Price && (
              <TableRow TableRow style={event_details_display_styles.row}>
                <TableCell style={event_details_display_styles.label}>Price:</TableCell>
                <TableCell style={event_details_display_styles.value}>{event.Price}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </TableContainer>
    </Box>
  );
}

export default EventDetailsTable;
