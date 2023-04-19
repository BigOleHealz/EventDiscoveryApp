import React, { useState } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel, RightSidePanel } from './container_components/SidePanels';


export default function App() {
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  const handleLeftButtonClick = () => {
    setIsLeftPanelVisible(!isLeftPanelVisible);
    setIsRightPanelVisible(false);
  };

  const handleRightButtonClick = () => {
    setIsRightPanelVisible(!isRightPanelVisible);
    setIsLeftPanelVisible(false);
  };

  return (
    <View style={[styles.container, styles.appTheme]}>
      <Toolbar onLeftButtonClick={handleLeftButtonClick} onRightButtonClick={handleRightButtonClick} />
      <View style={styles.fullScreen}>
        <Map />
        <LeftSidePanel isVisible={isLeftPanelVisible} />
        <RightSidePanel isVisible={isRightPanelVisible} />
      </View>
    </View>
  );
}
