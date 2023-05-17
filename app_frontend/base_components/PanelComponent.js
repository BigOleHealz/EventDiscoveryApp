import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import styles from '../styles';


export const PanelComponent = ({ isVisible, position, title, type, children, style }) => {
	const slideAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(slideAnim, {
			toValue: isVisible ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [isVisible]);

	// const panelStyle = type === 'top' ? panel_styles.topPanel : panel_styles.sidePanel;
	const panelPosition = type === 'top'
		? { top: slideAnim.interpolate({ inputRange: [0, 1], outputRange: position }) }
		: { left: slideAnim.interpolate({ inputRange: [0, 1], outputRange: position }) };

	return isVisible ? (
		<Animated.View style={[panelPosition, style]}>
			<View style={panel_styles.panelsContainer}>
				<Text style={panel_styles.panelTitleStyle}>{title}</Text>
				{children}
			</View>
		</Animated.View>
	) : null;
};

const panel_styles = StyleSheet.create({
	panelsContainer: {
		backgroundColor: styles.appTheme.backgroundColor,
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		padding: 10,
		width: '100%',
	},
	panelTitleStyle: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
		color: styles.appTheme.color
	},
})
