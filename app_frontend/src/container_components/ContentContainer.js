import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { CreateEventLocationSelector } from '../composite_components/CreateEventLocationSelector';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from '../composite_components/Modals';
import { CreateEventWorkflow } from '../composite_components/CreateEventWorkflow';
import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({
  ...props
}) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Box style={{ position: 'relative' }}>
        <Map {...props} />
        <CreateEventWorkflow {...props} />
      </Box>
    </Box>
  )
}
