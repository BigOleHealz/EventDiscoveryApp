import React, { useState } from 'react';

import Slider from '@mui/material/Slider';

import { day_end_time } from '../utils/constants';
import { TextComponent } from './TextComponent';
import BoxComponent from './BoxComponent';
import { time_range_slider_styles } from '../styles';

export const TimeRangeSliderComponent = ({ startTime, endTime, setStartTime, setEndTime }) => {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  const handleStartTimeChange = (value) => {
    const start_time_db_string = numberToDesiredTimeString(value);
    setStart(start_time_db_string);
    setStartTime(start_time_db_string); // Update the parent state
  };

  const handleEndTimeChange = (value) => {
    const end_time_db_string = numberToDesiredTimeString(value);
    setEnd(end_time_db_string);
    setEndTime(end_time_db_string); // Update the parent state
  };

  function formatTime(time) {
    const [hour, minute, second] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute, second);

    if (time === day_end_time) {
      return '11:59 PM';
    } else {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    }
  };

  function numberToDesiredTimeString(number) {
    if (number === 24) {
      return day_end_time;
    }
    const hour = Math.floor(number);
    return `${hour.toString().padStart(2, '0')}:00:00`;
  };

  function convertTimeStringToHour(time) {
    const [hour, minute, second] = time.split(':');
    if (time === day_end_time) {
      return 24;
    } else {
      return parseInt(hour, 10);
    }
  };

  const handleSliderChange = (event, newValue) => {
    handleStartTimeChange(newValue[0]);
    handleEndTimeChange(newValue[1]);
  };

  return (
    <BoxComponent style={time_range_slider_styles.container}>
      <Slider
        value={[convertTimeStringToHour(start), convertTimeStringToHour(end)]}
        onChange={handleSliderChange}
        min={0}
        max={24}
        step={1}
        valueLabelDisplay="auto"
      />
      <BoxComponent style={time_range_slider_styles.text_labels}>
        <TextComponent>{formatTime(start)}</TextComponent>
        <TextComponent>{formatTime(end)}</TextComponent>
      </BoxComponent>
    </BoxComponent>
		
	);
};
