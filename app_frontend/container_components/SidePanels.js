import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSlider } from '../base_components/TimeRangeSlider';
import { TimeSlider } from '../base_components/TimeSlider';
import { Button } from '../base_components/Button';
import styles from '../styles';

const SidePanelContainer = ({ isVisible, side, title, children }) => {
	const slideAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(slideAnim, {
			toValue: isVisible ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isVisible]);

	const panelPosition = side === 'left'
	? { left: slideAnim.interpolate({ inputRange: [0, 1], outputRange: ['-30%', '0%'] }) }
	: { right: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [isVisible ? '-30%' : '100%', '0%'] }) };

	return isVisible ? (
		<Animated.View style={[side_panel_styles.sidePanel, side === 'left' ? side_panel_styles.leftPanel : side_panel_styles.rightPanel, panelPosition]}>
			<View style={side_panel_styles.sidePanelContentContainerStyle}>
				<Text style={side_panel_styles.sidePanelTitleStyle}>{title}</Text>
				{children}
			</View>
		</Animated.View>
    ) : null;
};

const LeftSidePanel = (props) => {

    const handleDateSelected = (date) => {
        console.log('Left side panel selected date:', date);
        // Perform any actions needed with the selected date
    };

    const handleTimeRangeValuesChange = (values) => {
        console.log('Start:', values[0], 'End:', values[1]);
        // Perform any actions needed with the time range values
    };
    
    return (
    <SidePanelContainer id="left-panel" side="left" title="Find Games" {...props}>
        <CalendarComponent id="left-calendar" onDateSelected={handleDateSelected} />
        <TimeRangeSlider onValuesChange={handleTimeRangeValuesChange}/>
    </SidePanelContainer>
    );
};

const RightSidePanel = (props) => {
	const { isVisible } = props;
	const handleDateSelected = (date) => {
		console.log('Right side panel selected date:', date);
	  // Perform any actions needed with the selected date
	};

	const handleTimeSelected = (time) => {
		console.log('Right side panel selected time:', time);
	  // Perform any actions needed with the selected time
	};

	const handleSubmitButtonClick = () => {
		console.log('Button clicked!');
	};

	return (
		<SidePanelContainer id="right-panel" side="right" title="Create Game" isVisible={isVisible}>
			<CalendarComponent id="right-calendar" onDateSelected={handleDateSelected} />
			<TimeSlider onValueChange={handleTimeSelected}/>
			<Button title="Submit" onPress={handleSubmitButtonClick} />
		</SidePanelContainer>
	);
};

const side_panel_styles = StyleSheet.create({
	panelsContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flex: 1,
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
	sidePanel: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		width: '30%',
		backgroundColor: styles.appTheme.backgroundColor,
		justifyContent: 'center',
		alignItems: 'center',
		// Shadow styles for elevation
		shadowColor: '#000',
		shadowOffset: {
			width: 10,
			height: 10,
		},
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 5,
	},

	sidePanelContentContainerStyle: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		padding: 10,
		width: '100%',
	},
	sidePanelTitleStyle: {
		fontSize: 24, // Adjust the font size as desired
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		color: styles.appTheme.color
	},

	leftPanel: {
		left: 0,
	},
	rightPanel: {
		right: 0,
	},
})

export { LeftSidePanel, RightSidePanel };
