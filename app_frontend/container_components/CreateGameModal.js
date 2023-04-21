import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { CreateGameTimeSelector } from '../base_components/CreateGameTimeSelector';
import { Button } from '../base_components/Button';
import styles from '../styles';


const ModalComponent = ({ isVisible, onRequestClose, children }) => {
    return (
      <Modal visible={isVisible} onRequestClose={onRequestClose} animationType="slide" transparent>
        <TouchableWithoutFeedback onPressOut={onRequestClose}>
          <View style={modal_styles.backdrop}>
            <View
              onStartShouldSetResponder={() => true}
              style={modal_styles.modalContainer}
            >
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  
  

const modal_styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '80%',
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styles.appTheme.backgroundColor,
    borderRadius: 10,
  },
});

export const CreateGameDateTimeModal = ({ isVisible, onRequestClose }) => {

	const handleDateSelected = (date) => {
		console.log('Create Game panel selected date:', date);
	  // Perform any actions needed with the selected date
	};

	const handleTimeSelected = (time) => {
		console.log('Create Game panel selected time:', time);
	  // Perform any actions needed with the selected time
	};

    
	const handleSubmitButtonClick = () => {
		console.log('Button clicked!');
	};

    return (
      <ModalComponent isVisible={isVisible} onRequestClose={onRequestClose}>
        <CalendarComponent id="create-game-calendar" onDateSelected={handleDateSelected} />
        <CreateGameTimeSelector onValueChange={handleTimeSelected} />
        <Button id="create-game-select-datetime-button" title="Set Date & Time" onPress={handleSubmitButtonClick} />
      </ModalComponent>
    );
  };


// Add this to your CreateGameModals.js
export const InviteFriendsModal = ({ isVisible, onRequestClose }) => {
  return (
    <ModalComponent isVisible={isVisible} onRequestClose={onRequestClose}>
      <Text style={{ fontSize: 24 }}>bigolehealz</Text>
    </ModalComponent>
  );
};
