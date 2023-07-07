import React, { useEffect, useState } from 'react';
import { ScrollView, View, CheckBox, Text, StyleSheet, Switch } from 'react-native';
import { toast } from 'react-toastify';

import { TextComponent } from '../base_components/TextComponent';
import { GET_EVENT_TYPES } from '../db/queries';
import { useCustomCypherRead } from '../hooks/CustomCypherHooks';
import styles from '../styles';

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

    const {
        transactionStatus: get_event_types_status,
        executeQuery: run_get_event_types,
        resetTransactionStatus: reset_get_event_types_transaction_status,
      } = useCustomCypherRead(GET_EVENT_TYPES);
    
    useEffect(() => {
        if (first_run ) {
            run_get_event_types({});
        }
    }, [first_run]);

    useEffect(() => {
      if (get_event_types_status.STATUS === 'ERROR') {
        toast.error(`Error Getting Event Types: ${get_event_types_status.RESPONSE}`);
        console.error(get_event_types_status.RESPONSE);
        reset_get_event_types_transaction_status();
        setFirstRun(false);
      } else if (get_event_types_status.STATUS === 'SUCCESS') {
        let eventTypeList;
        if (eventTypesSelected) {
          eventTypeList = get_event_types_status.RESPONSE.RECORDS.map(
              (eventType) => {
                  return {
                      ...eventType,
                      isChecked: eventTypesSelected.includes(eventType.UUID)
                  };
              }
          );
        } else {
          eventTypeList = get_event_types_status.RESPONSE.RECORDS.map(
            (eventType) => {
                return {
                    ...eventType,
                    isChecked: false
                };
            }
          );
        }
        setEventTypes(eventTypeList);
        reset_get_event_types_transaction_status();
        setFirstRun(false);
        } else {
          console.log('Something else happened')
        }
    }, [get_event_types_status]);

  const EventTypeChecklistItem = ({ name, isChecked, onValueChange }) => {
    return (
      <View style={selectInterestsScrollviewStyles.itemContainer}>
        <CheckBox value={isChecked} onValueChange={onValueChange} />
        <Text style={selectInterestsScrollviewStyles.itemText}>{name}</Text>
      </View>
    );
  };

  return (
    <View style={selectInterestsScrollviewStyles.parentContainer}>
      <View style={selectInterestsScrollviewStyles.switchContainer}>
        <Switch
          TestID="switch-select-all-interests"
          value={select_all_switch_toggled_flag}
          onValueChange={handleSelectAllSwitchToggledFlagChange}
        />
        <TextComponent style={selectInterestsScrollviewStyles.switchLabel}>
          Toggle All Event Types
        </TextComponent>
      </View>
      <ScrollView TestID="scrollview-select-interests" style={selectInterestsScrollviewStyles.scrollView}>
        {event_types.map((eventType, index) => (
          <EventTypeChecklistItem
            key={eventType.UUID}
            name={eventType.EventType}
            isChecked={eventType.isChecked}
            onValueChange={(newValue) => handleValueChange(index, newValue)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const selectInterestsScrollviewStyles = StyleSheet.create({
  parentContainer: {
    paddingTop: 20,
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  switchLabel: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: styles.appTheme.color,
  },
  buttonStyle: {
    marginBottom: 20,
    backgroundColor: '#2196F3',
  },
  scrollView: {
    margin: 20,
    shadowColor: '#000',
		shadowOffset: {
			width: 10,
			height: 10,
		},
		shadowOpacity: 0.5,
		shadowRadius: 10,
		elevation: 5,
  },
});
