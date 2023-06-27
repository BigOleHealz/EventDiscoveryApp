
import React, { useEffect, useState } from 'react';
import { ScrollView, View, CheckBox, Text, StyleSheet } from 'react-native';
import { toast } from 'react-toastify';

import { GET_EVENT_TYPES } from '../db/queries';
import {
    useCustomCypherRead,
    useCustomCypherWrite,
} from '../hooks/CustomCypherHooks';
import styles from '../styles';

// EventTypeScrollView.js
export const EventTypeScrollView = ({ setEventTypesSelected, userSession }) => {
    console.log('Starting EventTypeScrollView component');
    if (userSession) {
        console.log('userSession.UUID:', userSession.UUID);
    } else {
        console.log('userSession is undefined');
    }


    const [event_types, setEventTypes] = useState([]);
    const [first_run, setFirstRun] = useState(true);

    const handleValueChange = (index, newValue) => {
        const updatedEventTypes = event_types.map((eventType, i) => {
          if (i === index) {
            return { ...eventType, isChecked: newValue };
          }
          return eventType;
        });
        setEventTypesSelected(updatedEventTypes);
    };
    

    const {
        transactionStatus: get_event_types_status,
        executeQuery: run_get_event_types,
        resetTransactionStatus: reset_get_event_types_transaction_status,
      } = useCustomCypherRead(GET_EVENT_TYPES);
    
      useEffect(() => {
        if (first_run) {
            if (userSession) {
                run_get_event_types({ "UUID": userSession.UUID });
            } else {
                console.log('Cannot run_get_event_types because userSession is undefined');
            }
        }
    }, [first_run]);
    
    
      useEffect(() => {
        console.log('get_event_types_status:', get_event_types_status)
        // Query for event types when the modal becomes visible
        if (get_event_types_status.STATUS === 'ERROR') {
          toast.error(`Error Getting Event Types: ${get_event_types_status.RESPONSE}`);
          console.error(get_event_types_status.RESPONSE);
          reset_get_event_types_transaction_status();
          setFirstRun(false);
        } else if (get_event_types_status.STATUS === 'SUCCESS') {
          console.log('Get Event Types Response:', get_event_types_status.RESPONSE);
          const eventTypeList = get_event_types_status.RESPONSE.RECORDS.map(
            (eventType) => {
              return {
                ...eventType,
                isChecked: false,
              };
            }
          );
    
          setEventTypes(eventTypeList);
          reset_get_event_types_transaction_status();
          setFirstRun(false);
          console.log('event_types:', event_types)
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
    // flex: 1,
    // maxHeight: 200,
    marginLeft: 20,
    marginRight: 20,
  },
});
