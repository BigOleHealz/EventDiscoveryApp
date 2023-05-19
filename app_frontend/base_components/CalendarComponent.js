import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from '../styles';

export const CalendarComponent = ({ selected, onDateSelected, style }) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(selected || currentDate);

  return (
    <View style={calendar_styles.view}>
      <Calendar
        style={style} // Merge the default styles with the passed-in style
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          console.log('Date Selected', day.dateString);
          onDateSelected(day.dateString); // Pass the new selected date to the parent component
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
            selectedDotColor: 'orange',
          },
        }}
        theme={calendar_styles.theme}
      />
    </View>
  );
};

const calendar_styles = StyleSheet.create({
  view: {
    padding: styles.appTheme.padding,
    width: '100%',
  },
  theme: {
    backgroundColor: '#222222',
    calendarBackground: '#222222',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#ddd',
    textDisabledColor: '#888',
    monthTextColor: '#ddd',
  },
});
