import React, { useState, useContext } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarOverrides.css'

import { LoggerContext } from '../utils/Contexts';
import { calendar_styles }  from '../styles';

export const CalendarComponent = ({ selected, onDateSelected, style }) => {
  const currentDate = new Date();
  const [selectedDate, setSelectedDate] = useState(selected || currentDate);
  const { logger } = useContext(LoggerContext);

  const onChange = date => {
    setSelectedDate(date);
    logger.info(`Date Selected: ${date}`);
    onDateSelected(date);
  };

  return (
    <div style={calendar_styles.view}>
      <Calendar
        value={selectedDate}
        onChange={onChange}
      />
    </div>
  );
};
