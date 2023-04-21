import React, { useState } from 'react';
import { View, Text } from 'react-native';
import TimePicker from 'react-time-picker';
import { StyleSheet } from 'react-native-web';
import './../styles.css';

export const TimeSelector = () => {
  const [time, setTime] = useState('12:00');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Time:</Text>
      <TimePicker
        className="react-time-picker"
        onChange={setTime}
        value={time}
        disableClock={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    marginRight: 5,
  },
});
