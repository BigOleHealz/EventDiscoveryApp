import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { TimeSlider } from '../base_components/TimeSlider';
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

export const CreateGameModal = ({ isVisible, onRequestClose }) => {

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
        <TimeSlider onValueChange={handleTimeSelected} />
        <Button title="Set Date & Time" onPress={handleSubmitButtonClick} />
      </ModalComponent>
    );
  };
