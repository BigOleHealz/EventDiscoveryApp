import React from "react";
import Box from "@mui/material/Box";

import { CreateEventWorkflow } from '../composite_components/CreateEventWorkflow';
import { AttendEventWorkflow } from '../composite_components/AttendEventWorkflow';
import { FriendRequestsModal } from '../composite_components/Modals';
import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({
  attend_event_stage,
  isFriendRequestsModalVisible,
  setIsFriendRequestsModalVisible,
  ...props
}) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Box style={{ position: 'relative' }}>
        <Map {...props} />
        <FriendRequestsModal
          isVisible={isFriendRequestsModalVisible}
          handleSubmitButtonClick={() => setIsFriendRequestsModalVisible(false)}
          onRequestClose={() => setIsFriendRequestsModalVisible(false)}
          {...props}
        />
        <CreateEventWorkflow {...props} />
        {/* {attend_event_stage &&
          <AttendEventWorkflow {...props} />
        } */}

      </Box>
    </Box>
  )
}
