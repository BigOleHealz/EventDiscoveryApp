import React, { useRef, useEffect } from 'react';
import { common_styles } from '../styles';

export const PanelComponent = ({ isVisible, position, title, type, children, style }) => {
	const slideAnim = useRef(0);

	useEffect(() => {
		// You might consider using a library like 'react-spring' or 'framer-motion' for smoother animations
		slideAnim.current = isVisible ? 1 : 0;
	}, [isVisible]);

	// Calculating position for the panel
	const panelPosition = type === 'top'
		? { top: `${slideAnim.current * position}px` }
		: { left: `${slideAnim.current * position}px` };

	return isVisible ? (
		<div style={{ ...panelPosition, ...panel_styles.panelsContainer, ...style }}>
			<div style={panel_styles.panelsContainer}>
				{title && (<h2 style={panel_styles.panelTitleStyle}>{title}</h2>)}
				{children}
			</div>
		</div>
	) : null;
};

const panel_styles = {
	panelsContainer: {
		backgroundColor: common_styles.appTheme.backgroundColor,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'stretch',
		width: '100%',
	},
	panelTitleStyle: {
		fontSize: '24px',
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: '10px',
		color: common_styles.appTheme.color
	},
};
