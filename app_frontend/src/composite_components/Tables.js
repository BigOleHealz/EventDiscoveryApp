import React, { useState } from 'react';
import { AcceptDeclineTable, CheckboxTableComponent } from '../base_components/TableComponents'; // Adjust the import path as necessary
import { useFetchEventTypes } from '../utils/Hooks';

export const FriendRequestsTable = () => {

  const rows = [
    { id: 1, name: 'Item 1', onAccept: () => console.log("Item 1 accepted"), onDecline: () => console.log("Item 1 declined") },
    { id: 2, name: 'Item 2', onAccept: () => console.log("Item 2 accepted"), onDecline: () => console.log("Item 2 declined") },
    { id: 3, name: 'Item 3', onAccept: () => console.log("Item 3 accepted"), onDecline: () => console.log("Item 3 declined") },
    { id: 4, name: 'Item 4', onAccept: () => console.log("Item 4 accepted"), onDecline: () => console.log("Item 4 declined") },
    { id: 5, name: 'Item 5', onAccept: () => console.log("Item 5 accepted"), onDecline: () => console.log("Item 5 declined") },
    { id: 6, name: 'Item 6', onAccept: () => console.log("Item 6 accepted"), onDecline: () => console.log("Item 6 declined") },
  ];

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
  console.log('EventTypesTable: event_types_selected = ', event_types_selected);
  return (
    <CheckboxTableComponent rows={rows} selected={event_types_selected} setSelected={setEventTypesSelected} />
  );
};
