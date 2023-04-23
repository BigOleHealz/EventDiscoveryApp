import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, FlatList, CheckBox } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { CreateGameTimeSelector } from '../base_components/CreateGameTimeSelector';
import { Button } from '../base_components/Button';
import { ModalComponent } from '../base_components/ModalComponent';

import styles from '../styles';



export const CreateGameDateTimeModal = ({ isVisible, onRequestClose, onSubmitButtonClick  }) => {

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
    onSubmitButtonClick();
  };

  return (
    <ModalComponent id="create-game-date-time-modal" isVisible={isVisible} onRequestClose={onRequestClose}>
      <CalendarComponent id="create-game-calendar" onDateSelected={handleDateSelected} />
      <CreateGameTimeSelector onValueChange={handleTimeSelected} />
      <Button id="create-game-select-datetime-button" title="Set Date & Time" onPress={handleSubmitButtonClick} />
    </ModalComponent>
  );
};


const FriendChecklistItem = ({ name, isChecked, onValueChange }) => {
  return (
    <View style={invite_friends_checklist_styles.itemContainer}>
      <CheckBox value={isChecked} onValueChange={onValueChange} />
      <Text style={invite_friends_checklist_styles.itemText}>{name}</Text>
    </View>
  );
};

export const InviteFriendsModal = ({ isVisible, onRequestClose, onButtonClick }) => {
  const friends = [
    { name: 'Alice', isChecked: false },
    { name: 'Bob', isChecked: false },
    { name: 'Charlie', isChecked: false },
    { name: 'Dave', isChecked: false },
    { name: 'Eva', isChecked: false },
  ];

  const [anyChecked, setAnyChecked] = React.useState(false);

  const handleValueChange = (index, newValue) => {
    friends[index].isChecked = newValue;
    setAnyChecked(friends.some(friend => friend.isChecked));
  };

  const handleButtonClick = () => {
    console.log('Button clicked!');
    if (onButtonClick) {
      onButtonClick();
    }
  };

  return (
    <ModalComponent
      id="create-game-invite-friend-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={invite_friends_checklist_styles.titleText}>Invite Friends</Text>
      <ScrollView>
        {friends.map((friend, index) => (
          <FriendChecklistItem
            key={index}
            name={friend.name}
            isChecked={friend.isChecked}
            onValueChange={(newValue) => handleValueChange(index, newValue)}
          />
        ))}
      </ScrollView>
      <Button
        id="create-game-invite-friends-button"
        title={anyChecked ? "Send Invites & Create Game" : "Skip & Create Game"}
        onPress={handleButtonClick}
        style={invite_friends_checklist_styles.buttonStyle}
      />
    </ModalComponent>
  );
};

const invite_friends_checklist_styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    margin: 20,
    fontSize: 36,
    color: styles.appTheme.color,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: styles.appTheme.color,
  },
  titleText: {
    fontSize: 24,
    marginBottom: 20,
    color: styles.appTheme.color,
  },
  buttonStyle: {
    marginTop: 20,
  },
});
