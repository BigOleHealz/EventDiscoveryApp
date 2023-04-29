import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { format } from 'date-fns';

import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel } from './container_components/SidePanels';
import { Neo4jProviderWrapper } from './db/DBHandler';

import ErrorBoundary from './utils/ErrorBoundary';


console.log("Starting App")


export default function App() {


  // Handle Map
  const defaultCenter = {
    lat: 39.9526,
    lng: -75.1652,
  };
  
  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);

  const currentDateTime = new Date();
  const [findGameStartTime, setFindGameStartTime] = useState(format(currentDateTime, 'HH:mm:ss'));
  const [findGameEndTime, setFindGameEndTime] = useState('23:59:59');
  const [findGameSelectedDate, setFindGameSelectedDate] = useState(format(currentDateTime, 'yyyy-MM-dd'));

  
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

  const createGameFunction = (location, dateTime, friendInviteList) => {
    console.log('Creating game with the following parameters:');
    console.log('Location:', location);
    console.log('Date & Time:', dateTime);
    console.log('Friend Invite List:', friendInviteList);
  
    // Add your game creation logic here
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
              // setIsCreateGameMode={setIsCreateGameMode}
              // createGameFunction={createGameFunction}
              findGameSelectedDate={findGameSelectedDate}
              // findGameStartTime={findGameStartTime}
              // findGameEndTime={findGameEndTime}
              setFindGameSelectedDate={setFindGameSelectedDate}
              // setFindGameStartTime={setFindGameStartTime}
              // setFindGameEndTime={setFindGameEndTime}
              // mapEventsFullDay={map_events_full_day}
            />
            <LeftSidePanel
              isVisible={isLeftPanelVisible}
              findGameSelectedDate={findGameSelectedDate}
              setFindGameSelectedDate={setFindGameSelectedDate}
              findGameStartTime={findGameStartTime}
              findGameEndTime={findGameEndTime}
            />
          </View>
        </View>
      </Neo4jProviderWrapper>
    </ErrorBoundary>
  );
};
