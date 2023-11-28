import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';

import BoxComponent from '../base_components/BoxComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { EventTypesTable } from './Tables';
import { day_start_time, day_end_time } from '../utils/constants';


export default function LeftSidePanel({
  is_left_panel_visible,
  setIsLeftPanelVisible,
  find_event_selected_date,
  setFindEventSelectedDate,
  find_event_start_time,
  setFindEventStartTime,
  find_event_end_time,
  setFindEventEndTime,
  event_types_selected,
  setEventTypesSelected,
  ...props
}) {
  const anchor = 'left';

  const [state, setState] = React.useState({
    [anchor]: is_left_panel_visible,
  });

  React.useEffect(() => {
    setState({ ...state, [anchor]: is_left_panel_visible });
  }, [is_left_panel_visible]);

  const handleDateSelected = (date) => {
    console.log('handleDateSelected: date = ', date);
    setFindEventSelectedDate(date);
    setFindEventStartTime(day_start_time);
    setFindEventEndTime(day_end_time);
  };

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={state[anchor]}
      onClose={() => {
        setState({ ...state, [anchor]: false });
        setIsLeftPanelVisible(false);
      }}
      onOpen={() => {
        setState({ ...state, [anchor]: true });
        setIsLeftPanelVisible(true);
      }}
    >
      <BoxComponent sx={{
        display: "flex",
        flexDirection: "column",
        // justifyContent: "space-between",
        position: 'relative',
        height: '100%',
      }}>
        <CalendarComponent
          testid="left-calendar"
          selected={find_event_selected_date}
          onDateSelected={handleDateSelected}
        />
        <TimeRangeSliderComponent
          startTime={find_event_start_time}
          setStartTime={setFindEventStartTime}
          endTime={find_event_end_time}
          setEndTime={setFindEventEndTime}
        />
        <Box sx={{
          position: 'relative',
          flexGrow: 1,
          overflow: 'auto'
        }}>
          <EventTypesTable
            event_types_selected={event_types_selected}
            setEventTypesSelected={setEventTypesSelected}
          />
        </Box>
      </BoxComponent>
    </SwipeableDrawer>
  );
};
