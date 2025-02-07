import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { TextComponent } from '../base_components/TextComponent'; // Assuming you also have a web version of this
import { useFetchEventTypes } from '../utils/Hooks';

import { select_interests_scrollview_styles } from '../styles'; // You might need to adjust styles

export const SelectInterestsScrollView = ({
  event_types_selected = [],
  setEventTypesSelected,
  singleSelect = false
}) => {
  const [event_types, setEventTypes] = useState([]);
  const [first_run, setFirstRun] = useState(true);
  const [select_all_switch_toggled_flag, setSelectAllSwitchToggledFlag] = useState(false);

  // console.log('SelectInterestsScrollView-event_types_selected:', event_types_selected);

  useFetchEventTypes(first_run, setFirstRun, setEventTypes, event_types_selected, setEventTypesSelected);

  const handleSelectAllSwitchToggledFlagChange = (newValue) => {
    setSelectAllSwitchToggledFlag(newValue);
    const updatedEventTypes = event_types.map((eventType) => {
      return { ...eventType, isChecked: newValue };
    });
    setEventTypes(updatedEventTypes);
    let checkedUUIDs = updatedEventTypes.filter(item => item.isChecked).map(item => item.UUID);
    setEventTypesSelected(checkedUUIDs);
  };

  const handleValueChange = (index, newValue) => {
    console.log('event_types_selected:', event_types_selected);
    if(singleSelect && newValue) {
      let uncheckedEventTypes = event_types.map((eventType) => {
        return { ...eventType, isChecked: false };
      });
  
      let updatedEventTypes = uncheckedEventTypes.map((eventType, i) => {
        if (i === index) {
          return { ...eventType, isChecked: true };
        }
        return eventType;
      });
      
      setEventTypes(updatedEventTypes);

      const event_type_object = {
        "EventTypeUUID": updatedEventTypes[index].UUID,
        "EventType": updatedEventTypes[index].EventType
      }
      console.log('event_type_object:', event_type_object)
      setEventTypesSelected(event_type_object)
    } else {
      const updatedEventTypes = event_types.map((eventType, i) => {
        if (i === index) {
          return { ...eventType, isChecked: newValue };
        }
        return eventType;
      });
  
      setEventTypes(updatedEventTypes);
      let checkedUUIDs = updatedEventTypes.filter(item => item.isChecked).map(item => item.UUID);
      setEventTypesSelected(checkedUUIDs);
      console.log('updatedEventTypes:', updatedEventTypes);
    }
  };

  const EventTypeChecklistItem = ({ name, isChecked, onValueChange, color }) => {
    return (
      <Box style={select_interests_scrollview_styles.itemContainer}>
        <Checkbox 
          checked={isChecked}
          onChange={onValueChange}
          style={{color: color}}
        />
        <Typography style={select_interests_scrollview_styles.itemText}>
          {name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box style={select_interests_scrollview_styles.parentContainer}>
      { !singleSelect &&
        <Box style={select_interests_scrollview_styles.switchContainer}>
          <Switch
            value={select_all_switch_toggled_flag}
            onChange={(e) => handleSelectAllSwitchToggledFlagChange(e.target.checked)}
          />
          <TextComponent style={select_interests_scrollview_styles.switchLabel}>
            Toggle All Event Types
          </TextComponent>
        </Box>
      }
      <Box style={select_interests_scrollview_styles.scrollView}> 
        {event_types.map((eventType, index) => (
          <EventTypeChecklistItem
            key={eventType.UUID}
            name={eventType.EventType}
            isChecked={eventType.isChecked}
            color={eventType.PinColor}
            onValueChange={() => handleValueChange(index, !eventType.isChecked)}
          />
        ))}
      </Box>
    </Box>
  
  );
}
