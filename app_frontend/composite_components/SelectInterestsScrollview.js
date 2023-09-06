import React, { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { toast } from 'react-toastify';

import { TextComponent } from '../base_components/TextComponent';
import { select_interests_scrollview_styles }  from '../styles';

export const SelectInterestsScrollView = ({
  eventTypesSelected=[],
  setEventTypesSelected,
  singleSelect = false
}) => {
  const [event_types, setEventTypes] = useState([]);
  const [first_run, setFirstRun] = useState(true);
  const [select_all_switch_toggled_flag, setSelectAllSwitchToggledFlag] = useState(false);

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
    console.log('eventTypesSelected:', eventTypesSelected);
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

  useEffect(() => {
    if (first_run ) {
      fetch('/api/get_event_type_mappings', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(data => {
        console.log('event_type_mappings:', data);
        let eventTypeList;
        if (eventTypesSelected) {
          eventTypeList = data.map((eventType) => {
            return {
              ...eventType,
              isChecked: eventTypesSelected.includes(eventType.UUID)
            };
          });
        } else {
          eventTypeList = data.map((eventType) => {
            return {
              ...eventType,
              isChecked: false
            };
          });
        }
        setEventTypes(eventTypeList);
        setFirstRun(false);
      })
      .catch((error) => {
        toast.error(`Error Getting Event Types: ${error}`);
        console.error(error);
        setFirstRun(false);
      });
    }
  }, [first_run]);
  const EventTypeChecklistItem = ({ name, isChecked, onValueChange, color }) => {
    return (
      <View style={select_interests_scrollview_styles.itemContainer}>
        <Checkbox 
          status={isChecked ? 'checked' : 'unchecked'}
          color={color}
          uncheckedColor={color}
          onPress={onValueChange}
        />
        <Text style={select_interests_scrollview_styles.itemText}>{name}</Text>
      </View>
    );
  };

  return (
    <View style={select_interests_scrollview_styles.parentContainer}>
      <View style={select_interests_scrollview_styles.switchContainer}>
        <Switch
          TestID="switch-select-all-interests"
          value={select_all_switch_toggled_flag}
          onValueChange={handleSelectAllSwitchToggledFlagChange}
        />
        <TextComponent style={select_interests_scrollview_styles.switchLabel}>
          Toggle All Event Types
        </TextComponent>
      </View>
      <ScrollView TestID="scrollview-select-interests" style={select_interests_scrollview_styles.scrollView}>
        {event_types.map((eventType, index) => (
          <EventTypeChecklistItem
            key={eventType.UUID}
            name={eventType.EventType}
            isChecked={eventType.isChecked}
            color={eventType.PinColor}
            onValueChange={() => handleValueChange(index, !eventType.isChecked)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
