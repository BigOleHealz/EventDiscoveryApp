import React from 'react';

import { PanelComponent } from '../base_components/PanelComponent';
import { top_panel_styles }  from '../styles';

const TopPanel = ({ isVisible, toolbarHeight, title, children }) => {
	return (
		<PanelComponent
			type="top"
			position={["0px", `${toolbarHeight}px`]}
			title={title}
			isVisible={isVisible}
			style={top_panel_styles.container}
		>
			{children}
		</PanelComponent >
	);
};

export { TopPanel };
