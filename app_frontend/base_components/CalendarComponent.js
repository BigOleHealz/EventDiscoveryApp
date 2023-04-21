import React, { useState } from 'react';
import { View, Text, StyleSheet  } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import '../css/calendar.css'

export const CalendarComponent = () => {
  const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));

  return (
    <Calendar
      style={calendarStyles.calendar} // Apply the new style here
      onDayPress={day => {
        setSelected(day.dateString);
        console.log("Date Selected", day.dateString);
      }}
      markedDates={{
        [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
      }}
      theme={{
        backgroundColor: '#222222',
        calendarBackground: '#222222',
        textSectionTitleColor: '#b6c1cd',
        selectedDayBackgroundColor: '#00adf5',
        selectedDayTextColor: '#ffffff',
        todayTextColor: '#00adf5',
        dayTextColor: '#ddd',
        textDisabledColor: '#888',
        monthTextColor: '#ddd',
      }}
    />
  );
};


const calendarStyles = StyleSheet.create({
  calendar: {
    width: 600,
    height: 400, // Adjust the height as needed
  },
});