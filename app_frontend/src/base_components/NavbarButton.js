import React from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const button_sx = { my: 2, color: "white", display: "block", width: "25%" }
const button_content_small_sx = { display: { xs: "block", sm: "block", md: "none" } }
const button_content_large_sx = { display: { xs: "none", sm: "none", md: "block" } }

const NavbarButton = ({ id, onClick, Icon, text }) => (
  <Button
    id={id}
    onClick={onClick}
    sx={button_sx}
  >
    <Box sx={button_content_small_sx}>
      <Icon />
    </Box>
    <Box sx={button_content_large_sx}>
      {text}
    </Box>
  </Button>
);

export default NavbarButton;
