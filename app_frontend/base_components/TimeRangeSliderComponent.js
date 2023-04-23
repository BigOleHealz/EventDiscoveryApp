import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import RangeSlider from 'react-native-range-slider-expo';
import styles from '../styles';

export const TimeRangeSliderComponent = ({ onValuesChange }) => {
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(24);

    const handleStartTimeChange = (value) => {
		setStartTime(value);
	};

	const handleEndTimeChange = (value) => {
		setEndTime(value);
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
				handleLabelStyle={{ backgroundColor: 'transparent', color: '#000' }}
				handleLabelVisible
				labelStyle={{ fontSize: 16, color: '#000' }}
				labelPrefix="Time: "
				labelSuffix=" hrs"
				initialFromValue={startTime}
				initialToValue={endTime}
			/>
			<View style={styles.timeSliderView}>
				<Text style={time_range_slider_styles.text}>{startTime}</Text>
				<Text style={time_range_slider_styles.text}>{endTime}</Text>
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
