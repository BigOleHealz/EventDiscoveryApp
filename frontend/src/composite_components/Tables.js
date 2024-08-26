import React, { useContext, useEffect, useState } from 'react';

import moment from 'moment';
import { Box, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { AcceptDeclineTable, CheckboxTableComponent } from '../base_components/TableComponents';

import { UserSessionContext } from '../utils/Contexts';
import { convertUTCDateToLocalDate } from '../utils/HelperFunctions';
import {
  useFetchEventTypes,
  useFetchFriends,
  useFetchPendingEventInvites,
  useFetchPendingFriendRequests,
  useRespondToEventInvite,
  useRespondToFriendRequest
} from '../utils/Hooks';

import { common_styles, event_invite_styles } from '../styles';

export const FriendRequestsTable = ({
  user_session,
}) => {

  const [pending_friend_requests, setPendingFriendRequests] = useState([]);
  const [fetching_pending_friend_requests, setFetchingPendingFriendRequests] = useState(true);

  const [friend_request_response, setFriendRequestResponse] = useState(null);
  const rows = pending_friend_requests.map((friend_request) => {
    return {
      id: friend_request.UUID,
      content: <Box>{friend_request.SENDER_USERNAME}</Box>,
      onAccept: () => setFriendRequestResponse({ friend_request_uuid: friend_request.UUID, response: "ACCEPTED" }),
      onDecline: () => setFriendRequestResponse({ friend_request_uuid: friend_request.UUID, response: "DECLINED" })
    }
  });

  useFetchPendingFriendRequests(user_session, fetching_pending_friend_requests, setFetchingPendingFriendRequests, setPendingFriendRequests)
  useRespondToFriendRequest(friend_request_response, setFriendRequestResponse, setFetchingPendingFriendRequests)

  return (
    <AcceptDeclineTable rows={rows} />
  );
};

export const EventInvitesTable = ({
  user_session,
}) => {

  const [pending_event_invites, setPendingEventInvites] = useState([]);
  const [fetching_pending_event_invites, setFetchingPendingEventInvites] = useState(true);

  const [event_invite_response, setEventInviteResponse] = useState(null);


  const rows = pending_event_invites.map((event_invite, index) => {
    return {
      id: event_invite.InviteUUID,
      content: (
        <>
          <Box style={event_invite_styles.container}>
            <Box style={event_invite_styles.title}>{event_invite.EventName}</Box>
            <TableContainer component={Paper}>
              <Table>
                <TableBody sx={event_invite_styles.table}>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Invited By:</TableCell>
                    <TableCell style={event_invite_styles.value}>{event_invite.InviterUsername}</TableCell>
                  </TableRow>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Address:</TableCell>
                    <TableCell style={event_invite_styles.value}>{event_invite.Address}</TableCell>
                  </TableRow>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Time:</TableCell>
                    <TableCell style={event_invite_styles.value}>{moment(convertUTCDateToLocalDate(event_invite.StartTimestamp)).format('hh:mm a')} - {moment(convertUTCDateToLocalDate(event_invite.EndTimestamp)).format('hh:mm a')}</TableCell>
                  </TableRow>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Event Type:</TableCell>
                    <TableCell style={event_invite_styles.value}>{event_invite.EventType}</TableCell>
                  </TableRow>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Attendees:</TableCell>
                    <TableCell style={event_invite_styles.value}>{event_invite.AttendeeCount}</TableCell>
                  </TableRow>
                  <TableRow style={event_invite_styles.row}>
                    <TableCell style={event_invite_styles.label}>Price:</TableCell>
                    <TableCell style={event_invite_styles.value}>{event_invite.Price}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

            </TableContainer>
          </Box>
          {index !== pending_event_invites.length - 1 && <Divider />}
        </>
      ),
      onAccept: () => setEventInviteResponse({ event_invite_uuid: event_invite.InviteUUID, response: "ACCEPTED" }),
      onDecline: () => setEventInviteResponse({ event_invite_uuid: event_invite.InviteUUID, response: "DECLINED" })
    }
  });

  useFetchPendingEventInvites(user_session, fetching_pending_event_invites, setFetchingPendingEventInvites, setPendingEventInvites)
  useRespondToEventInvite(event_invite_response, setEventInviteResponse, setFetchingPendingEventInvites)

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <AcceptDeclineTable rows={rows} />
    </Box>
  );
};

export const EventTypesTable = ({
  event_types_selected = [],
  setEventTypesSelected
}) => {

  const { user_session, setUserSession } = useContext(UserSessionContext);

  const [event_types, setEventTypes] = useState([]);
  const [first_run, setFirstRun] = useState(true);

  useEffect(() => {
    if (user_session === null) {
      setEventTypesSelected(event_types.map((event_type) => event_type.UUID));
    }
  }, [event_types]);

  useFetchEventTypes(first_run, setFirstRun, setEventTypes, event_types_selected, setEventTypesSelected);

  const rows = event_types.map((event_type) => {
    return {
      id: event_type.UUID,
      label: event_type.EventType,
      checkboxColor: event_type.PinColor,
      isChecked: event_types_selected.includes(event_type.UUID),
    }
  });
  return (
    <CheckboxTableComponent rows={rows} selected={event_types_selected} setSelected={setEventTypesSelected} />
  );
};

export const InviteFriendsToEventTable = ({
  friends_invited,
  setFriendsInvited,
  friends_list=[]
}) => {

  const { user_session, setUserSession } = useContext(UserSessionContext);
  const [is_fetching_friends, setIsFetchingFriends] = useState(true);


  const rows = friends_list.map((friend) => {
    return {
      id: friend.UUID,
      label: friend.Username,
      isChecked: false
    }
  });

  return (
    <CheckboxTableComponent
      rows={rows}
      selected={friends_invited}
      setSelected={setFriendsInvited}
    />
  );
};
