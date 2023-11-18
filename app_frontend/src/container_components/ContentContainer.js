import React from "react";
import Box from "@mui/material/Box";

import { CreateEventWorkflow } from '../composite_components/CreateEventWorkflow';
import { AttendEventWorkflow } from '../composite_components/AttendEventWorkflow';
import { EventInvitesModal, FriendRequestsModal } from '../composite_components/Modals';
import LeftSidePanel from '../composite_components/LeftSidePanel';
import Map from '../composite_components/Map';

export default function ContentContainer({
  attend_event_stage,
  is_event_invites_modal_visible,
  setIsEventInvitesModalVisible,
  is_friend_requests_modal_visible,
  setIsFriendRequestsModalVisible,
  ...props
}) {

  return (
    <Box id="content-container">
      <LeftSidePanel {...props} />
      <Box style={{ position: 'relative' }}>
        <Map {...props} />
        <EventInvitesModal
          isVisible={is_event_invites_modal_visible}
          onRequestClose={() => setIsEventInvitesModalVisible(false)}
          {...props}
        />
        <FriendRequestsModal
          isVisible={is_friend_requests_modal_visible}
          onRequestClose={() => setIsFriendRequestsModalVisible(false)}
          {...props}
        />
        <CreateEventWorkflow {...props} />
        <AttendEventWorkflow {...props} />

      </Box>
    </Box>
  )
}
