import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { format } from 'date-fns';

import styles from './styles';
import { Toolbar } from './container_components/Toolbar';
import { Map } from './container_components/Map';
import { LeftSidePanel } from './container_components/Panels';
import { day_start_time, day_end_time, day_format } from './utils/constants';
import { RetrieveAndStoreUserSessionData, getUserSession } from './utils/SessionManager';


export function AppHandler() {
  RetrieveAndStoreUserSessionData();
  const [userSession, setUserSession] = useState({});
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const session = await getUserSession();
        setUserSession(session);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };
  
    fetchUserSession();
  }, []);
  console.log("Starting App")



  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  const resetAllStates = () => {
    setIsLeftPanelVisible(false);
    setIsCreateGameMode(false);
    setIsEventInvitesPanelVisible(false);
    setIsFriendRequestsPanelVisible(false);
  };

  const currentDateTime = new Date();
  const [findGameStartTime, setFindGameStartTime] = useState(day_start_time);
  const [findGameEndTime, setFindGameEndTime] = useState(day_end_time);
  const [findGameSelectedDate, setFindGameSelectedDate] = useState(format(currentDateTime, day_format));

  const handleFindGamesButtonClick = () => {
    console.log('Find Games button clicked')
    resetAllStates();
    setIsLeftPanelVisible(!isLeftPanelVisible);
  };

  // Handle Modal
  const handleCreateGameButtonClick = () => {
    console.log('Create Game button clicked');
    resetAllStates();
    setIsCreateGameMode(!isCreateGameMode);
  };

  const handleEventInvitesButtonClick = () => {
    resetAllStates();
    setIsEventInvitesPanelVisible(!isEventInvitesPanelVisible);
    console.log("Notification button clicked")
  };

  const handleFriendRequestsButtonClick = () => {
    resetAllStates();
    setIsFriendRequestsPanelVisible(!isFriendRequestsPanelVisible);
    console.log("Friends button clicked")
  };

  return (
    <View style={styles.container}>
      <RetrieveAndStoreUserSessionData />
        <Toolbar
          onLeftButtonClick={handleFindGamesButtonClick}
          onRightButtonClick={handleCreateGameButtonClick}
          isEventInvitesPanelVisible={isEventInvitesPanelVisible}
          onEventInvitesButtonClick={handleEventInvitesButtonClick}
          isFriendRequestsPanelVisible={isFriendRequestsPanelVisible}
          onFriendRequestsButtonClick={handleFriendRequestsButtonClick}
        />
        <View style={styles.fullScreen}>
          <Map
            isCreateGameMode={isCreateGameMode}
            setIsCreateGameMode={setIsCreateGameMode}
            findGameSelectedDate={findGameSelectedDate}
            findGameStartTime={findGameStartTime}
            findGameEndTime={findGameEndTime}
            userSession={userSession}
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
  );
};
