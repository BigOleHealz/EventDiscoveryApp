import React, { useState } from 'react';
import { View } from 'react-native';
import { format } from 'date-fns';

import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel } from './container_components/SidePanels';
import { Neo4jProviderWrapper } from './db/DBHandler';
import { day_start_time, day_end_time, day_format } from './utils/constants';
import { storeUserSession } from './utils/SessionManager';

import ErrorBoundary from './utils/ErrorBoundary';

  
export default function App() {
  console.log("Starting App")

  storeUserSession();

  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };
  
  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);

  const currentDateTime = new Date();
  const [findGameStartTime, setFindGameStartTime] = useState(day_start_time);
  const [findGameEndTime, setFindGameEndTime] = useState(day_end_time);
  const [findGameSelectedDate, setFindGameSelectedDate] = useState(format(currentDateTime, day_format));

  
  const handleFindGamesButtonClick = () => {
    console.log('Find Games button clicked')
    setIsCreateGameMode(false);
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  // Handle Modal
  const handleCreateGameButtonClick = () => {
    console.log('Create Game button clicked');
    setIsLeftPanelVisible(false);
    setIsCreateGameMode(!isCreateGameMode);
  };


  return (
    
    <ErrorBoundary>
      <Neo4jProviderWrapper>

        <View style={styles.container}>
          <Toolbar onLeftButtonClick={handleFindGamesButtonClick} onRightButtonClick={handleCreateGameButtonClick} />
          <View style={styles.fullScreen}>
            <Map
              defaultCenter={defaultCenter}
              isCreateGameMode={isCreateGameMode}
              setIsCreateGameMode={setIsCreateGameMode}
              findGameSelectedDate={findGameSelectedDate}
              findGameStartTime={findGameStartTime}
              findGameEndTime={findGameEndTime}
            />
            <LeftSidePanel
              isVisible={isLeftPanelVisible}
              findGameSelectedDate={findGameSelectedDate}
              setFindGameSelectedDate={setFindGameSelectedDate}
              findGameStartTime={findGameStartTime}
              setFindGameStartTime={setFindGameStartTime}
              findGameEndTime={findGameEndTime}
              setFindGameEndTime={setFindGameEndTime}
            />
          </View>
        </View>
      </Neo4jProviderWrapper>
    </ErrorBoundary>
  );
};
