import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';

import NavbarButton from '../base_components/NavbarButton';
import { common_styles } from "../styles";

export default function Navbar({
  navbarHeight,
  is_left_panel_visible,
  setIsLeftPanelVisible,
  isEventInvitesPanelVisible,
  setIsEventInvitesPanelVisible,
  isFriendRequestsModalVisible,
  setIsFriendRequestsModalVisible,
  create_event_stage,
  initializeCreateEventMode,
  exitCreateEventMode,
  resetAllStates,

  ...props
}) {

  const handleFindEventsButtonClick = () => {
    if (is_left_panel_visible === false) {
      resetAllStates();
      setIsLeftPanelVisible(true);
    } else {
      setIsLeftPanelVisible(false);
    }
    console.log('handleFindEventsButtonClick: is_left_panel_visible = ', is_left_panel_visible);
  };

  const handleEventInvitesButtonClick = () => {
    if (isEventInvitesPanelVisible === false) {
      resetAllStates();
      setIsEventInvitesPanelVisible(true);
    } else {
      setIsEventInvitesPanelVisible(false);
    }
    console.log('handleEventInvitesButtonClick: isEventInvitesPanelVisible = ', isEventInvitesPanelVisible);
  };

  const handleFriendRequestsButtonClick = () => {
    if (isFriendRequestsModalVisible === false) {
      resetAllStates();
      setIsFriendRequestsModalVisible(true);
    } else {
      setIsFriendRequestsModalVisible(false);
    }
    console.log('handleFriendRequestsButtonClick: isFriendRequestsModalVisible = ', isFriendRequestsModalVisible);
  };

  const handleCreateEventButtonClick = () => {
    if (create_event_stage === 0) {
      resetAllStates();
      initializeCreateEventMode();
    } else {
      exitCreateEventMode();
    }
  };

  return (
    <AppBar
      position="static"
      className="bg-quaternary text-primary font-heading shadow-none border-none w-full"
      style={{ background: common_styles.appTheme.backgroundColor, color: 'white' }}
    >
      <Toolbar
        disableGutters
        className="bg-quaternary"
      >
        <Box id="box-navbar"
          sx={{
            flexGrow: 1,
            display: { xs: "flex", sm: "flex", md: "flex" },
            width: "100%",
            height: navbarHeight
          }}>
          <NavbarButton
            id="button-find-events"
            onClick={handleFindEventsButtonClick}
            Icon={SearchIcon}
            text="Find Events"
          />
          <NavbarButton
            id="button-event-invites"
            onClick={handleEventInvitesButtonClick}
            Icon={EventIcon}
            text="Event Invites"
          />
          <NavbarButton
            id="button-friend-requests"
            onClick={handleFriendRequestsButtonClick}
            Icon={PeopleAltIcon}
            text="Friend Requests"
          />
          <NavbarButton
            id="button-create-event"
            onClick={handleCreateEventButtonClick}
            Icon={AddIcon}
            text="Create Event"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
