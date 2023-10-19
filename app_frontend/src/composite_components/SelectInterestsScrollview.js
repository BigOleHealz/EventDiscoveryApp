import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import BoxComponent from '../base_components/BoxComponent';
import { TextComponent } from '../base_components/TextComponent';
import { useFetchEventTypes } from '../utils/Hooks';

import { select_interests_scrollview_styles } from '../styles';

export const SelectInterestsScrollView = ({
  event_types_selected = [],
  setEventTypesSelected,
  singleSelect = false
}) => {
  const [event_types, setEventTypes] = useState([]);
  const [first_run, setFirstRun] = useState(true);
  const [select_all_switch_toggled_flag, setSelectAllSwitchToggledFlag] = useState(false);

  useFetchEventTypes(first_run, setFirstRun, setEventTypes);

  const handleEventTypeSelection = (isChecked, uuid) => {
    if (isChecked) {
      setEventTypesSelected((prevSelected) => [...prevSelected, uuid]);
    } else {
      setEventTypesSelected((prevSelected) => prevSelected.filter(id => id !== uuid));
    }
  };

  const handleSelectAllSwitchToggledFlagChange = (isChecked) => {
    setSelectAllSwitchToggledFlag(isChecked);  // updating the switch toggle flag state

    if (isChecked) {
      const allUUIDs = event_types.map(eventType => eventType.UUID);
      setEventTypesSelected(allUUIDs);
    } else {
      setEventTypesSelected([]);
    }
  };

  const EventTypeChecklistItem = ({ name, isChecked, onValueChange, color }) => {
    return (
      <BoxComponent style={select_interests_scrollview_styles.itemContainer}>
        <Checkbox
          checked={isChecked}
          onChange={onValueChange}
          style={{ color: color }}
        />
        <Typography style={select_interests_scrollview_styles.itemText}>
          {name}
        </Typography>
      </BoxComponent>
    );
  };

  return (
    <BoxComponent style={select_interests_scrollview_styles.parentContainer}>
      {!singleSelect &&
        <BoxComponent style={select_interests_scrollview_styles.switchContainer}>
          <Switch
            value={select_all_switch_toggled_flag}
            onChange={(e) => handleSelectAllSwitchToggledFlagChange(e.target.checked)}
          />
          <TextComponent style={select_interests_scrollview_styles.switchLabel}>
            Toggle All Event Types
          </TextComponent>
        </BoxComponent>
      }
      <BoxComponent style={select_interests_scrollview_styles.scrollView}>
        {event_types.map((eventType, index) => (
          <EventTypeChecklistItem
            key={eventType.UUID}
            name={eventType.EventType}
            isChecked={event_types_selected.includes(eventType.UUID)}
            color={eventType.PinColor}
            onValueChange={(e) => handleEventTypeSelection(e.target.checked, eventType.UUID)}
          />
        ))}
      </BoxComponent>
    </BoxComponent>
  );
}
