// HomePage.js

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { day_start_time, day_end_time, day_format } from '../utils/constants';
import { LoggerContext, UserSessionContext } from '../utils/Contexts';
import { Toolbar } from '../container_components/Toolbar';
import { Map } from '../container_components/Map';
import { LeftSidePanel } from '../container_components/LeftSidePanel';

import { common_styles }  from '../styles';

export function HomePage() {
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  if (!userSession) {
    return null;
  }

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

  return (
    <>
      <div style={common_styles.container}>
        <Toolbar
          onLeftButtonClick={handleFindGamesButtonClick}
          setToolbarHeight={setToolbarHeight}
        />
      </div>
        
      <div style={common_styles.fullScreen}>
        <Map
          findGameSelectedDate={findGameSelectedDate}
          findGameStartTime={findGameStartTime}
          findGameEndTime={findGameEndTime}
          eventTypesSelected={event_types_selected}
        />
        <LeftSidePanel
          isVisible={isLeftPanelVisible}
          toolbarHeight={toolbarHeight}
          findGameSelectedDate={findGameSelectedDate}
          setFindGameSelectedDate={setFindGameSelectedDate}
          findGameStartTime={findGameStartTime}
          setFindGameStartTime={setFindGameStartTime}
          findGameEndTime={findGameEndTime}
          setFindGameEndTime={setFindGameEndTime}
          eventTypesSelected={event_types_selected}
          setEventTypesSelected={setEventTypesSelected}
        />
      </div>
    </>
        
  );
}
