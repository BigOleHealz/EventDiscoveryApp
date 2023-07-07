import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import RangeSlider from 'react-native-range-slider-expo';
import styles from '../styles';
import { day_end_time } from '../utils/constants';

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
  
  function sliderValueToFormattedTime(value) {
    if (value === 24) {
      return '11:59 PM';
    } else {
      const hour = value % 12 === 0 ? 12 : value % 12;
      const period = value < 12 ? 'AM' : 'PM';
      return `${hour} ${period}`;
    }
  };
  

	return (
		<View>
			<RangeSlider
				min={0}
				max={24}
				step={1}
				fromValueOnChange={handleStartTimeChange}
				toValueOnChange={handleEndTimeChange}
				lineWidth={3}
				thumbRadius={15}
				thumbBorderWidth={1}
				thumbBorderColor="#ddd"
				selectedColor="#2196F3"
				unselectedColor="#ddd"
				containerStyle={{ marginTop: 20 }}
        handleLabel={sliderValueToFormattedTime}
				handleLabelStyle={{ backgroundColor: 'transparent', color: '#000' }}
				handleLabelVisible={false}
				labelStyle={{ fontSize: 16, color: '#000' }}
				labelPrefix="Time: "
				labelSuffix=" hrs"
				initialFromValue={0}
				initialToValue={24}
        showRangeLabels={false}
			/>
      <View style={styles.timeSliderView}>
				<Text style={time_range_slider_styles.text}>{formatTime(start)}</Text>
				<Text style={time_range_slider_styles.text}>{formatTime(end)}</Text>
			</View>
		</View>
	);
};

const time_range_slider_styles = StyleSheet.create({
    view: {
        padding: 20,
    },
    text: {
        color: styles.appTheme.color
    }
});
