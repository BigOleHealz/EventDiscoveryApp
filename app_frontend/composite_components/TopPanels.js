import React from 'react';
import { StyleSheet } from 'react-native';

import { PanelComponent } from '../base_components/PanelComponent';
import styles from '../styles';

const TopPanel = ({ isVisible, toolbarHeight, title, children }) => {
	return (
		<PanelComponent
			type="top"
			position={["0px", `${toolbarHeight}px`]}
			title={title}
			isVisible={isVisible}
			style={panel_styles.topPanel}
		>
			{children}
		</PanelComponent >
	);
};


const panel_styles = StyleSheet.create({
	topPanel: {
		position: 'absolute',
		left: '20%',
		right: '20%',
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

export { TopPanel };
