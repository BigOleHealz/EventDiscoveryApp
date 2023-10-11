import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/calendarOverrides.css'

import { getDateStringFromDateObject } from '../utils/HelperFunctions';
import { calendar_styles }  from '../styles';

export const CalendarComponent = ({ selected, onDateSelected, style }) => {

  const onChange = date => {
    const formatted_date = getDateStringFromDateObject(date);
    onDateSelected(formatted_date);
  };

  return (
    <div style={calendar_styles.view}>
      <Calendar
        onChange={onChange}
        calendarType="US"
      />
    </div>
  );
};
