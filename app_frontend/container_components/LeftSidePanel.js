import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { PanelComponent } from '../base_components/PanelComponent';
import { EventTypeScrollView } from '../composite_components/SelectInterestsScrollview';
import { day_start_time, day_end_time } from '../utils/constants';

import styles from '../styles';

export const LeftSidePanel = ({
  isVisible,
  findGameSelectedDate,
  setFindGameSelectedDate,
  findGameStartTime,
  setFindGameStartTime,
  findGameEndTime,
  setFindGameEndTime,
  userSession
}) => {
  console.log('Starting LeftSidePanel component');
  const [event_types_selected, setEventTypesSelected] = useState([]);

  const handleDateSelected = (date) => {
    console.log('Left side panel selected date:', date);
    setFindGameSelectedDate(date);
    setFindGameStartTime(day_start_time);
    setFindGameEndTime(day_end_time);
  };

  return (
    <PanelComponent
      testID="left-side-panel"
      type="left"
      position={['-30%', '0%']}
      title="Find Games"
      isVisible={isVisible}
      style={panel_styles.sidePanel}
    >
      <CalendarComponent
        testID="left-calendar"
        selected={findGameSelectedDate}
        onDateSelected={handleDateSelected}
      />
      <TimeRangeSliderComponent
        startTime={findGameStartTime}
        setStartTime={setFindGameStartTime}
        endTime={findGameEndTime}
        setEndTime={setFindGameEndTime}
      />
      <EventTypeScrollView
        setEventTypesSelected={setEventTypesSelected}
        userSession={userSession}
      />
    </PanelComponent>
  );
};

const panel_styles = StyleSheet.create({
  sidePanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: styles.appTheme.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  sidePanelContentContainerStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 10,
    width: '100%',
  },
});
