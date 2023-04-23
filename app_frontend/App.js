import React, { useState } from 'react';
import { View } from 'react-native';
import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel } from './container_components/SidePanels';

export default function App() {
  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);

  const handleLeftButtonClick = () => {
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };
  // Handle Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const handleRightButtonClick = () => {
    setIsCreateMode(!isCreateMode);
  };

  // Handle pin drop from Create Game panel
  const [pinPosition, setPinPosition] = useState(null);

  return (
    <View style={[styles.container, styles.appTheme]}>
      <Toolbar onLeftButtonClick={handleLeftButtonClick} onRightButtonClick={handleRightButtonClick} />
      <View style={styles.fullScreen}>
        <Map
          defaultCenter={defaultCenter}
          pinPosition={pinPosition}
          onPinDragEnd={setPinPosition}
          isCreateMode={isCreateMode}
          setIsCreateMode={setIsCreateMode}
        />
        <LeftSidePanel isVisible={isLeftPanelVisible} />
      </View>
    </View>
  );
};
