import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, ScrollView, FlatList, Dimensions } from 'react-native';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeRangeSliderComponent } from '../base_components/TimeRangeSliderComponent';
import styles from '../styles';
import { day_start_time, day_end_time } from '../utils/constants';


const PanelContainer = ({ isVisible, position, title, type, children, style }) => {
	const slideAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(slideAnim, {
			toValue: isVisible ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isVisible]);

	const panelStyle = type === 'top' ? panel_styles.topPanel : panel_styles.sidePanel;
	const panelPosition = type === 'top'
		? { top: slideAnim.interpolate({ inputRange: [0, 1], outputRange: position }) }
		: { left: slideAnim.interpolate({ inputRange: [0, 1], outputRange: position }) };

	return isVisible ? (
		<Animated.View style={[panelStyle, panelPosition, style]}>
			<View style={panel_styles.sidePanelContentContainerStyle}>
				<Text style={panel_styles.sidePanelTitleStyle}>{title}</Text>
				{children}
			</View>
		</Animated.View>
	) : null;
};


const TopPanel = ({ isVisible, position, title, children }) => {
	return (
		<PanelContainer
			type="top"
			position={position}
			title={title}
			isVisible={isVisible}
			style={panel_styles.topPanel}
		>
			{children}
		</PanelContainer >
	);
};


const LeftSidePanel = ({
	isVisible,
	findGameSelectedDate,
	setFindGameSelectedDate,
	findGameStartTime,
	setFindGameStartTime,
	findGameEndTime,
	setFindGameEndTime,
}) => {
	console.log("Starting LeftSidePanel component");

	const handleDateSelected = (date) => {
		console.log('Left side panel selected date:', date);
		setFindGameSelectedDate(date);
		setFindGameStartTime(day_start_time);
		setFindGameEndTime(day_end_time);
	};

	return (
		<PanelContainer
			testID="left-side-panel"
			type="left"
			position={["-30%", "0%"]}
			title="Find Games"
			isVisible={isVisible}
		>
			<CalendarComponent
				id="left-calendar"
				selected={findGameSelectedDate}
				onDateSelected={handleDateSelected}
				style={panel_styles.calendarStyle}
			/>
			<TimeRangeSliderComponent
				startTime={findGameStartTime}
				setStartTime={setFindGameStartTime}
				endTime={findGameEndTime}
				setEndTime={setFindGameEndTime}
			/>
		</PanelContainer>
	);
};


const panel_styles = StyleSheet.create({
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
		zIndex: 10,
	},
	calendarStyle: {
		width: '100%',
		// margin: 10
	},
	topPanel: {
		position: 'absolute',
		left: '20%', // Add this
		right: '20%', // Add this
		backgroundColor: styles.appTheme.backgroundColor,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 10,
			height: 10,
		},
		width: '60%',
		shadowOpacity: 0.25,
		shadowRadius: 10,
		elevation: 5,
		zIndex: 10,
		overflow: 'hidden',
	},

})

export { LeftSidePanel, TopPanel };
