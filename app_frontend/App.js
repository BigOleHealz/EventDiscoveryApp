import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { View } from 'react-native';
import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel } from './container_components/SidePanels';
import { Neo4jProviderWrapper } from './db/DBHandler';

export default function App() {

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };
  
  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);

  const handleFindGamesButtonClick = () => {
    setIsCreateGameMode(false);
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  // Handle Modal
  const handleCreateGameButtonClick = () => {
    setIsLeftPanelVisible(false);
    setIsCreateGameMode(!isCreateGameMode);
  };

  const createGameFunction = (location, dateTime, friendInviteList) => {
    console.log('Creating game with the following parameters:');
    console.log('Location:', location);
    console.log('Date & Time:', dateTime);
    console.log('Friend Invite List:', friendInviteList);
  
    // Add your game creation logic here
  };
  

  return (
    <Neo4jProviderWrapper>

      <View style={[styles.container, styles.appTheme]}>
        <Toolbar onLeftButtonClick={handleFindGamesButtonClick} onRightButtonClick={handleCreateGameButtonClick} />
        <View style={styles.fullScreen}>
          <Map
            defaultCenter={defaultCenter}
            isCreateGameMode={isCreateGameMode}
            setIsCreateGameMode={setIsCreateGameMode}
            createGameFunction={createGameFunction}
          />
          <LeftSidePanel isVisible={isLeftPanelVisible} />
        </View>
      </View>
    </Neo4jProviderWrapper>
  );
};
