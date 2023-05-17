import React, { useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Slider } from 'react-native-elements';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/datePickerStyles.css'
import styles from '../styles';

export const CreateGameTimeSelectorComponent = ({ onValueChange }) => {
  const [time, setTime] = useState(new Date());

  const handleTimeChange = (value) => {
    setTime(value);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <View style={create_game_time_selector.view}>
      {Platform.OS === 'web' ? (
        <DatePicker
          selected={time}
          onChange={handleTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
        />
      ) : (
        <>
          <Slider
            minimumValue={0}
            maximumValue={24}
            step={1}
            onValueChange={handleTimeChange}
            value={time}
            minimumTrackTintColor="#2196F3"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#ddd"
          />
          <View style={styles.timeSliderView}>
            <Text style={create_game_time_selector.text}>0</Text>
            <Text style={create_game_time_selector.text}>{time.toFixed(0)}</Text>
            <Text style={create_game_time_selector.text}>24</Text>
          </View>
        </>
      )}
    </View>
  );
};

const create_game_time_selector = StyleSheet.create({
  view: {
    padding: 20,
    zIndex: 1000,
    width: '100%',
  },
  text: {
    color: styles.appTheme.color,
  },
});
