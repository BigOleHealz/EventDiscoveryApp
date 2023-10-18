// import * as React from "react";
import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import DiamondIcon from "@mui/icons-material/Diamond";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

export default function Navbar({ ...props }) {

  return (
    <AppBar
      position="static"
      className="bg-quaternary text-primary font-heading shadow-none border-none w-full"
      style={{ background: '#1E2022' }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          className="bg-quaternary"
        >
          <Box id="box-find-events" sx={{ flexGrow: 1, display: { xs: "flex", sm: "flex", md: "flex"}}}>
            <Button
              id="button-find-events"
              onClick={props.onFindEventsButtonClick}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Find Events
            </Button>

          </Box>

          <Box id="box-create-event" sx={{ flexGrow: 1, display: { xs: "flex", sm: "flex", md: "flex" }, justifyContent: "flex-end" }}>
            <Button
              id="button-create-event"
              onClick={props.onCreateEventButtonClick}
              sx={{ my: 2, color: "white", display: "block" }}
            >
              Create Event
            </Button>
          </Box>

        </Toolbar>
      </Container>
    </AppBar>
  );
}


          {/* <Box id="box-banner" sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
            <Box id="box-banner-content" sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
              <DiamondIcon
                sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}
              />
              <Typography
                variant="h5"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  flexGrow: 1,
                  fontFamily: "metropolis",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                DISCOVRY
              </Typography>
            </Box>
          </Box> */}
