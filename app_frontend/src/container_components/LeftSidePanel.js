import React from 'react';

import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { PanelComponent } from '../base_components/PanelComponent';
import { SelectInterestsScrollView } from '../composite_components/SelectInterestsScrollview';
import { day_start_time, day_end_time } from '../utils/constants';

import { side_panel_styles } from '../styles';

export const LeftSidePanel = ({
  isVisible,
  toolbarHeight,
  findGameSelectedDate,
  setFindGameSelectedDate,
  findGameStartTime,
  setFindGameStartTime,
  findGameEndTime,
  setFindGameEndTime,
  eventTypesSelected,
  setEventTypesSelected
}) => {

  const adjustedStyles = {
    ...side_panel_styles.container,
    top: toolbarHeight
  };


  const handleDateSelected = (date) => {
    setFindGameSelectedDate(date);
    setFindGameStartTime(day_start_time);
    setFindGameEndTime(day_end_time);
  };

  return (
    <PanelComponent
      testid="left-side-panel"
      type="left"
      position={['-30%', '0%']}
      isVisible={isVisible}
      style={adjustedStyles}
    >
      <CalendarComponent
        testid="left-calendar"
        selected={findGameSelectedDate}
        onDateSelected={handleDateSelected}
      />
      <TimeRangeSliderComponent
        startTime={findGameStartTime}
        setStartTime={setFindGameStartTime}
        endTime={findGameEndTime}
        setEndTime={setFindGameEndTime}
      />
      <SelectInterestsScrollView
        eventTypesSelected={eventTypesSelected}
        setEventTypesSelected={setEventTypesSelected}
      />
    </PanelComponent>
  );
};
