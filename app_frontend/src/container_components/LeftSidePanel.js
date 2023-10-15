import React from 'react';

import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import { PanelComponent } from '../base_components/PanelComponent';
import { SelectInterestsScrollView } from '../composite_components/SelectInterestsScrollview';
import { day_start_time, day_end_time } from '../utils/constants';

import { side_panel_styles } from '../styles';

export const LeftSidePanel = ({
  isVisible,
  findEventSelectedDate,
  setFindEventSelectedDate,
  findEventStartTime,
  setFindEventStartTime,
  findEventEndTime,
  setFindEventEndTime,
  eventTypesSelected,
  setEventTypesSelected
}) => {

  const handleDateSelected = (date) => {
    setFindEventSelectedDate(date);
    setFindEventStartTime(day_start_time);
    setFindEventEndTime(day_end_time);
  };

  return (
    <PanelComponent
      testid="left-side-panel"
      type="left"
      position={['-30%', '0%']}
      isVisible={isVisible}
      style={side_panel_styles.container}
    >
      <CalendarComponent
        testid="left-calendar"
        selected={findEventSelectedDate}
        onDateSelected={handleDateSelected}
      />
      <TimeRangeSliderComponent
        startTime={findEventStartTime}
        setStartTime={setFindEventStartTime}
        endTime={findEventEndTime}
        setEndTime={setFindEventEndTime}
      />
      <SelectInterestsScrollView
        eventTypesSelected={eventTypesSelected}
        setEventTypesSelected={setEventTypesSelected}
      />
    </PanelComponent>
  );
};
