// import * as React from "react";
import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

import { UserSessionContext } from '../utils/Contexts';
import { removeUserSession } from '../utils/SessionManager';

import { common_styles } from "../styles";

export default function Footer({
  ...props
}) {

  const { user_session, setUserSession } = React.useContext(UserSessionContext);

  return (
    <AppBar
      position="static"
      className="bg-quaternary text-primary font-heading shadow-none border-none w-full"
      style={{ background: common_styles.appTheme.backgroundColor, color: 'white' }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          className="bg-quaternary"
        >
          <Box id="box-logout" sx={{ flexGrow: 1, display: { xs: "flex", sm: "flex", md: "flex"}}}>
            <Button
              id="button-logout"
              onClick={() => {
                setUserSession(null)
                // toast.success("Successfully logged out!")
                removeUserSession()
              }}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Logout
            </Button>

          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
