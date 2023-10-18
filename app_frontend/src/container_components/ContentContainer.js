import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({ ...props }) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Map {...props} />
    </Box>
  )
}
