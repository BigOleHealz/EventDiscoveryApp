// HomePage.js

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { Toolbar } from '../container_components/Toolbar';
import { Map } from '../container_components/Map';
import { LeftSidePanel } from '../container_components/LeftSidePanel';
import { CreateEventDatetimeModal, CreateGameSelectEventTypeModal, CreateGameDetailsModal } from '../container_components/Modals';

import { day_start_time, day_end_time, day_format, iconSvg } from '../utils/constants';
import { LoggerContext, UserSessionContext, CreateGameContext } from '../utils/Contexts';
import { useCreateGameNode } from '../utils/Hooks';
import { common_styles }  from '../styles';

export function HomePage() {

  const { create_game_context, setCreateGameContext } = React.useContext(CreateGameContext);
  const { userSession, setUserSession } = React.useContext(UserSessionContext);
  const [event_types_selected, setEventTypesSelected] = useState(userSession ? userSession.Interests : []);
  const [is_creating_game_node, setIsCreatingGameNode] = useState(false);

  useCreateGameNode(is_creating_game_node, create_game_context, setIsCreatingGameNode);

  // Handle left side panel
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isCreateGameMode, setIsCreateGameMode] = useState(false);
  const [isEventInvitesPanelVisible, setIsEventInvitesPanelVisible] = useState(false);
  const [isFriendRequestsPanelVisible, setIsFriendRequestsPanelVisible] = useState(false);

  if (!userSession) {
    return null;
  }


  // const [createGameData, setCreateGameData] = useState({});
  const [ isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible ] = useState(false);
  const [ isCreateGameSelectEventTypeModalVisible, setIsCreateGameSelectEventTypeModalVisible ] = useState(false);
  // const [ isCreateGameInviteFriendsModalVisible, setIsInviteFriendsToEventModalVisible ] = useState(false);
  const [ isCreateEventDetailsModalVisible, setIsCreateEventDetailsModalVisible ] = useState(false);


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

  const handleCreateGameButtonClick = () => {
    console.log('Create Game button clicked')
    resetAllStates();
    setIsCreateGameDateTimeModalVisible(true);
  };

  const exitCreateGameMode = () => {
    setIsCreateGameDateTimeModalVisible(false);
    setIsCreateGameSelectEventTypeModalVisible(false);
    // setIsInviteFriendsToEventModalVisible(false);
    setIsCreateEventDetailsModalVisible(false);
    setCreateGameContext({});
    setIsCreateGameMode(false);
  };

  const handleCreateGameDateTimeModalSubmitButtonClick = () => {
    setIsCreateGameDateTimeModalVisible(false);
    setIsCreateGameSelectEventTypeModalVisible(true);
  };

  const handleCreateGameEventTypeModalSubmitButtonClick = () => {
    setIsCreateGameSelectEventTypeModalVisible(false);
    setIsCreateEventDetailsModalVisible(true);
  };

  const handleCreateGameDetailsModalSubmitButtonClick = () => {
    createGame();
    setIsCreateEventDetailsModalVisible(false);
    // setIsInviteFriendsToEventModalVisible(true);
  };

  const createGame = () => {
    setCreateGameContext({
      ...create_game_context,
      CreatedByUUID: userSession.UUID
    });
    setIsCreatingGameNode(true);
  };

  
  return (
    <>
      <div style={common_styles.container}>
        <Toolbar
          onLeftButtonClick={handleFindGamesButtonClick}
          onRightButtonClick={handleCreateGameButtonClick}
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
          findGameSelectedDate={findGameSelectedDate}
          setFindGameSelectedDate={setFindGameSelectedDate}
          findGameStartTime={findGameStartTime}
          setFindGameStartTime={setFindGameStartTime}
          findGameEndTime={findGameEndTime}
          setFindGameEndTime={setFindGameEndTime}
          eventTypesSelected={event_types_selected}
          setEventTypesSelected={setEventTypesSelected}
        />
        <CreateEventDatetimeModal
          isVisible={isCreateGameDateTimeModalVisible}
          onRequestClose={exitCreateGameMode}
          onSubmitButtonClick={handleCreateGameDateTimeModalSubmitButtonClick}
        />
        <CreateGameSelectEventTypeModal
          isVisible={isCreateGameSelectEventTypeModalVisible}
          onRequestClose={exitCreateGameMode}
          onSubmitButtonClick={handleCreateGameEventTypeModalSubmitButtonClick}
        />
        <CreateGameDetailsModal
          isVisible={isCreateEventDetailsModalVisible}
          onRequestClose={exitCreateGameMode}
          onSubmitButtonClick={handleCreateGameDetailsModalSubmitButtonClick}
        />
      </div>
    </>
        
  );
}
