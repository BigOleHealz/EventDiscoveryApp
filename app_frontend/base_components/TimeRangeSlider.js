import React, { useState } from 'react';
import { View, Text } from 'react-native';
import RangeSlider from 'react-native-range-slider-expo';

export const TimeRangeSlider = ({ onValuesChange }) => {
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
			<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
				<Text>{startTime}</Text>
				<Text>{endTime}</Text>
			</View>
		</View>
	);
};
