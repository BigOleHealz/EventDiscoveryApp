import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { CreateEventLocationSelector } from '../composite_components/CreateEventLocationSelector';
import { CreateEventDatetimeModal, CreateEventSelectEventTypeModal, CreateEventDetailsModal } from '../composite_components/Modals';
import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({
  create_event_stage,
  handleGetLocationCoordinates,
  handleCreateEventDateTimeModalSubmitButtonClick,
  handleCreateEventEventTypeModalSubmitButtonClick,
  handleCreateEventDetailsModalSubmitButtonClick,
  exitCreateEventMode,
  ...props
}) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Box style={{position: 'relative'}}>
      <Map {...props} />

      <CreateEventLocationSelector
        isVisible={create_event_stage === 1}
        handleGetLocationCoordinates={handleGetLocationCoordinates}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}
      />
      </Box>
      <CreateEventDatetimeModal
        isVisible={create_event_stage === 2}
        onRequestClose={exitCreateEventMode}
        onSubmitButtonClick={handleCreateEventDateTimeModalSubmitButtonClick}
      />
      <CreateEventSelectEventTypeModal
        isVisible={create_event_stage === 3}
        onRequestClose={exitCreateEventMode}
        onSubmitButtonClick={handleCreateEventEventTypeModalSubmitButtonClick}
      />
      <CreateEventDetailsModal
        isVisible={create_event_stage === 4}
        onRequestClose={exitCreateEventMode}
        onSubmitButtonClick={handleCreateEventDetailsModalSubmitButtonClick}
      />
    </Box>
  )
}
