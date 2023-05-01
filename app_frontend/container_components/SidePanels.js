import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import styles from '../styles';
import { day_start_time, day_end_time } from '../utils/constants';

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

const LeftSidePanel = ({
	isVisible,
	findGameSelectedDate,
	setFindGameSelectedDate,
	findGameStartTime,
	setFindGameStartTime,
	findGameEndTime,
	setFindGameEndTime
}) => {
	console.log("Starting LeftSidePanel component");

    const handleDateSelected = (date) => {
        console.log('Left side panel selected date:', date);
		setFindGameSelectedDate(date);
		setFindGameStartTime(day_start_time);
		setFindGameEndTime(day_end_time);
    };

    
    return (
    <SidePanelContainer
		id="left-panel"
		side="left"
		title="Find Games" 
		isVisible={isVisible}
	>
        <CalendarComponent
			id="left-calendar"
			selected={findGameSelectedDate} // Pass findGameSelectedDate
			onDateSelected={handleDateSelected}
			style={side_panel_styles.calendarStyle}
		/>
        <TimeRangeSliderComponent
			startTime={findGameStartTime} // Pass findGameStartTime
			setStartTime={setFindGameStartTime} // Pass setFindGameStartTime
			endTime={findGameEndTime} // Pass findGameEndTime
			setEndTime={setFindGameEndTime} // Pass setFindGameEndTime
		/>
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
	calendarStyle: {
		width: '100%',
		// margin: 10
	}
})

export { LeftSidePanel };
