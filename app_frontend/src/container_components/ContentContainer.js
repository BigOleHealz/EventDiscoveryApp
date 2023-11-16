import React from "react";
import Box from "@mui/material/Box";

import { CreateEventWorkflow } from '../composite_components/CreateEventWorkflow';
import { AttendEventWorkflow } from '../composite_components/AttendEventWorkflow';
import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({
  attend_event_stage,
  ...props
}) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Box style={{ position: 'relative' }}>
        <Map {...props} />
        <CreateEventWorkflow {...props} />
        {/* {attend_event_stage &&
          <AttendEventWorkflow {...props} />
        } */}

      </Box>
    </Box>
  )
}
