import React from 'react';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const button_sx = { color: "white", display: "block", width: "25%" }
const button_content_small_sx = { display: { xs: "block", sm: "block", md: "none" } }
const button_content_large_sx = { display: { xs: "none", sm: "none", md: "block" } }

const NavbarButton = ({ id, onClick, smallContent, largeContent }) => (
  <Button
    id={id}
    onClick={onClick}
    sx={button_sx}
  >
    <Box sx={button_content_small_sx}>
      {smallContent}
    </Box>
    <Box sx={button_content_large_sx}>
      {largeContent}
    </Box>
  </Button>
);

export default NavbarButton;
