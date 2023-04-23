import React, { useState } from 'react';
import { View, Text, StyleSheet  } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import '../css/calendar.css'

export const CalendarComponent = ({ selected }) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(selected || currentDate);


  return (
    <Calendar
      style={calendar_styles.calendar} // Apply the new style here
      onDayPress={day => {
        setSelectedDate(day.dateString);
        console.log("Date Selected", day.dateString);
      }}
      markedDates={{
        [selectedDate]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
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


const calendar_styles = StyleSheet.create({
  calendar: {
    width: 600,
    height: 400, // Adjust the height as needed
  },
});