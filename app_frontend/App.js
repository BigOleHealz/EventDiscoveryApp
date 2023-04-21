import React, { useState } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel, RightSidePanel } from './container_components/SidePanels';

export default function App() {
  // Handle left and right side panels
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

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };
  
  // Handle pin drop from Create Game panel
  const [pinPosition, setPinPosition] = useState(null);

  return (
    <View style={[styles.container, styles.appTheme]}>
      <Toolbar onLeftButtonClick={handleLeftButtonClick} onRightButtonClick={handleRightButtonClick} />
      <View style={styles.fullScreen}>
        <Map defaultCenter={defaultCenter} pinPosition={pinPosition} onPinDragEnd={setPinPosition} isRightPanelVisible={isRightPanelVisible} />

        <LeftSidePanel isVisible={isLeftPanelVisible} />
        <RightSidePanel isVisible={isRightPanelVisible} />
      </View>
    </View>
  );
}
