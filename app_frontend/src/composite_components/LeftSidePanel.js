import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';


import BoxComponent from '../base_components/BoxComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import PanelComponent from '../base_components/PanelComponent';
import { SelectInterestsScrollView } from './SelectInterestsScrollview';
import { day_start_time, day_end_time } from '../utils/constants';

import { common_styles } from '../styles';

export default function LeftSidePanel({
  isLeftPanelVisible,
  setIsLeftPanelVisible,
  find_event_selected_date,
  find_event_start_time,
  setFindEventStartTime,
  find_event_end_time,
  setFindEventEndTime,
  eventTypesSelected,
  setEventTypesSelected,
  // find_event_selected_date,
  // setFindEventSelectedDate,
  // find_event_start_time,
  // setFindEventStartTime,
  // find_event_end_time,
  // setFindEventEndTime,
  // eventTypesSelected,
  // setEventTypesSelected

  ...props
}) {
  const anchor = 'left';

  const [state, setState] = React.useState({
    [anchor]: isLeftPanelVisible,
  });

  React.useEffect(() => {
    setState({ ...state, [anchor]: isLeftPanelVisible });
  }, [isLeftPanelVisible]);

  const handleDateSelected = (date) => {
    props.setFindEventSelectedDate(date);
    props.setFindEventStartTime(day_start_time);
    props.setFindEventEndTime(day_end_time);
  };

  return (
    <React.Fragment>
      <SwipeableDrawer
        anchor={anchor}
        open={state[anchor]}
        onClose={() => {
          setState({ ...state, [anchor]: false });
          setIsLeftPanelVisible(false); // Close the panel
        }}
        onOpen={() => {
          setState({ ...state, [anchor]: true });
          setIsLeftPanelVisible(true); // Open the panel
        }}
      >
        <BoxComponent style={{height: '100%'}}>
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
          <SelectInterestsScrollView
            eventTypesSelected={eventTypesSelected}
            setEventTypesSelected={setEventTypesSelected}
          />
        </BoxComponent>
      </SwipeableDrawer>
    </React.Fragment>
  );
};
