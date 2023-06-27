import React, { useEffect, useState } from 'react';
import { ScrollView, View, CheckBox, Text, StyleSheet } from 'react-native';
import { toast } from 'react-toastify';

import { GET_EVENT_TYPES } from '../db/queries';
import { useCustomCypherRead } from '../hooks/CustomCypherHooks';
import styles from '../styles';

export const SelectInterestsScrollView = ({ eventTypesSelected, setEventTypesSelected }) => {


    const [event_types, setEventTypes] = useState([]);
    const [first_run, setFirstRun] = useState(true);

    const handleValueChange = (index, newValue) => {
        console.log('handleValueChange:', index, newValue);
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
      <View style={modalStyles.itemContainer}>
        <CheckBox value={isChecked} onValueChange={onValueChange} />
        <Text style={modalStyles.itemText}>{name}</Text>
      </View>
    );
  };

  return (
    <ScrollView TestID="scrollview-select-interests" style={modalStyles.scrollView}>
      {event_types.map((eventType, index) => (
        <EventTypeChecklistItem
          key={eventType.UUID}
          name={eventType.EventType}
          isChecked={eventType.isChecked}
          onValueChange={(newValue) => handleValueChange(index, newValue)}
        />
      ))}
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
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
    marginLeft: 20,
    marginRight: 20,
  },
});
