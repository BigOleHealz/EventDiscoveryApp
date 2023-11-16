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
  onFindEventsButtonClick,
  onEventInvitesButtonClick,
  onFriendRequestsButtonClick,
  onCreateEventButtonClick,
  ...props
}) {

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
            onClick={onFindEventsButtonClick}
            Icon={SearchIcon}
            text="Find Events"
          />
          <NavbarButton
            id="button-event-invites"
            onClick={onEventInvitesButtonClick}
            Icon={EventIcon}
            text="Event Invites"
          />
          <NavbarButton
            id="button-friend-requests"
            onClick={onFriendRequestsButtonClick}
            Icon={PeopleAltIcon}
            text="Friend Requests"
          />
          <NavbarButton
            id="button-create-event"
            onClick={onCreateEventButtonClick}
            Icon={AddIcon}
            text="Create Event"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}