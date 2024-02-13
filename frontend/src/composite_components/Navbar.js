import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';

import NavbarButton from '../base_components/NavbarButton';

import { UserSessionContext } from "../utils/Contexts";
import { AuthenticationManager } from "../utils/WorkflowManagers";
import { CreateUserProfileManager } from "../utils/WorkflowManagers";

import { common_styles } from "../styles";

export default function Navbar({
  navbarHeight,
  is_create_user_profile_manager_active,
  setIsCreateUserProfileManagerActive,
  is_left_panel_visible,
  setIsLeftPanelVisible,
  is_event_invites_modal_visible,
  setIsEventInvitesModalVisible,
  is_friend_requests_modal_visible,
  setIsFriendRequestsModalVisible,
  create_event_stage,
  initializeCreateEventMode,
  exitCreateEventMode,
  resetAllStates,

  ...props
}) {


  const { user_session, setUserSession } = React.useContext(UserSessionContext);
  const { login } = AuthenticationManager({setIsCreateUserProfileManagerActive});

  const handleFindEventsButtonClick = () => {
    if (is_left_panel_visible === false) {
      resetAllStates();
      setIsLeftPanelVisible(true);
    } else {
      setIsLeftPanelVisible(false);
    }
  };

  const handleEventInvitesButtonClick = () => {
    if (is_event_invites_modal_visible === false) {
      resetAllStates();
      setIsEventInvitesModalVisible(true);
    } else {
      setIsEventInvitesModalVisible(false);
    }
  };

  const handleFriendRequestsButtonClick = () => {
    if (is_friend_requests_modal_visible === false) {
      resetAllStates();
      setIsFriendRequestsModalVisible(true);
    } else {
      setIsFriendRequestsModalVisible(false);
    }
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
            height: navbarHeight,
            justifyContent: "space-between"
          }}>
          {user_session === null ? (
            <>
              <NavbarButton
                id="button-find-events"
                onClick={handleFindEventsButtonClick}
                smallContent="Find Events"
                largeContent="Find Events"
              />

              <NavbarButton
                id="button-Login"
                onClick={login}
                smallContent="Login"
                largeContent="Login"
              />
              <CreateUserProfileManager
                is_active={is_create_user_profile_manager_active}
                setIsActive={setIsCreateUserProfileManagerActive}
              />
            </>) :
            (
              <>
                <NavbarButton
                  id="button-find-events"
                  onClick={handleFindEventsButtonClick}
                  smallContent={<SearchIcon />}
                  largeContent="Find Events"
                />
                <NavbarButton
                  id="button-event-invites"
                  onClick={handleEventInvitesButtonClick}
                  smallContent={<EventIcon />}
                  largeContent="Event Invites"
                />
                <NavbarButton
                  id="button-friend-requests"
                  onClick={handleFriendRequestsButtonClick}
                  smallContent={<PeopleAltIcon />}
                  largeContent="Friend Requests"
                />
                <NavbarButton
                  id="button-create-event"
                  onClick={handleCreateEventButtonClick}
                  smallContent={<AddIcon />}
                  largeContent="Create Event"
                />
              </>
            )
          }
        </Box>
      </Toolbar>
    </AppBar>
  );
}
