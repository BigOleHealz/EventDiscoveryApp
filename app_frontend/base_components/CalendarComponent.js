import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

export const CalendarComponent = ({ onDateSelected }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const handleDateSelection = (day) => {
    const date = `${day.year}-${day.month}-${day.day}`;
    setSelectedDate(date);
    onDateSelected(date);
  };

  return (
    <View>
      <Calendar
        current={selectedDate}
        markedDates={{
          [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' },
        }}
        onDayPress={handleDateSelection}
      />
      <Text>Selected date: {selectedDate}</Text>
    </View>
  );
};
