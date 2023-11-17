import React, { useState } from 'react';
import { AcceptDeclineTable, CheckboxTableComponent } from '../base_components/TableComponents'; // Adjust the import path as necessary
import {
  useFetchEventTypes,
  useFetchPendingFriendRequests,
  useRespondToFriendRequest
} from '../utils/Hooks';

export const FriendRequestsTable = ({
  user_session,
}) => {

  const [pending_friend_requests, setPendingFriendRequests] = useState([]);
  const [fetching_pending_friend_requests, setFetchingPendingFriendRequests] = useState(true);

  const [friend_request_response, setFriendRequestResponse] = useState(null);
  const rows = pending_friend_requests.map((friend_request) => {
    return {
      id: friend_request.UUID,
      name: friend_request.SENDER_USERNAME,
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

export const EventTypesTable = ({
  event_types_selected = [],
  setEventTypesSelected
}) => {

  const [event_types, setEventTypes] = useState([]);
  const [first_run, setFirstRun] = useState(true);

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
