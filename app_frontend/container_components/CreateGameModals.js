import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, CheckBox } from 'react-native';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { CreateGameTimeSelectorComponent } from '../base_components/CreateGameTimeSelectorComponent';
import { ModalComponent } from '../base_components/ModalComponent';

import { getUserSession } from '../utils/SessionManager';
import styles from '../styles';


export const CreateGameDateTimeModal = ({ isVisible, onRequestClose, onSubmitButtonClick }) => {
  const current_date = new Date().toISOString();
  const current_date_split = current_date.split('T')
  const [date_selected, setDateSelected] = useState(current_date_split[0]);
  const [time_selected, setTimeSelected] = useState(current_date_split[1].slice(0, 8));

  const handleDateSelected = (date) => {
    console.log('Create Game panel selected date:', date);
    setDateSelected(date);
  };

  const handleTimeSelected = (time) => {
    const time_string = time.toISOString().split('T')[1].slice(0, 8);
    console.log('Parsed time string:', time_string);
    setTimeSelected(time_string);
  };

  const handleSubmitButtonClick = () => {
    const selected_datetime = `${date_selected}T${time_selected}`
    console.log('DateTime Selected: ', selected_datetime);
    onSubmitButtonClick(selected_datetime);
  };

  return (
    <ModalComponent
      id="create-game-select-datetime-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title="Select Date & Time"
    >
      <CalendarComponent
        id="create-game-date-selector"
        onDateSelected={handleDateSelected}
      />
      <CreateGameTimeSelectorComponent
        id="create-game-time-selector"
        onValueChange={handleTimeSelected}
      />
      <ButtonComponent
        id="create-game-select-datetime-button"
        title="Set Date & Time"
        onPress={handleSubmitButtonClick}
        style={modalStyles.buttonStyle}
      />
    </ModalComponent>
  );
};




const FriendChecklistItem = ({ name, isChecked, onValueChange }) => {
  return (
    <View style={modalStyles.itemContainer}>
      <CheckBox value={isChecked} onValueChange={onValueChange} />
      <Text style={modalStyles.itemText}>{name}</Text>
    </View>
  );
};

export const InviteFriendsModal = ({ isVisible, friendList, onRequestClose, onSubmitButtonClick }) => {
  const initialFriends = friendList.map(friend => {
    return {
      ...friend,
      isChecked: false
    };
  });
  
  const [friends, setFriends] = React.useState(initialFriends);
  const [anyChecked, setAnyChecked] = React.useState(false);

  const handleValueChange = (index, newValue) => {
    const updatedFriends = friends.map((friend, i) => {
      if (i === index) {
        return { ...friend, isChecked: newValue };
      }
      return friend;
    });
    setFriends(updatedFriends);
    setAnyChecked(updatedFriends.some(friend => friend.isChecked));
  };

  const handleSubmitButtonClick = () => {
    const selectedFriendUUIDs = friends.filter(friend => friend.isChecked).map(friend => friend.friendUUID);
    console.log('Selected friends:', selectedFriendUUIDs);
      onSubmitButtonClick(selectedFriendUUIDs);
  };

  return (
    <ModalComponent
      id="create-game-invite-friend-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={modalStyles.titleText}>Invite Friends</Text>
      <ScrollView>
        {friends.map((friend, index) => (
          <FriendChecklistItem
            key={friend.friendUUID}
            name={friend.friendUsername}
            isChecked={friend.isChecked}
            onValueChange={(newValue) => handleValueChange(index, newValue)}
          />
        ))}
      </ScrollView>
      <ButtonComponent
        id="create-game-invite-friends-button"
        title={anyChecked ? "Send Invites & Create Game" : "Skip & Create Game"}
        onPress={handleSubmitButtonClick}
        style={modalStyles.buttonStyle}
      />
    </ModalComponent>
  );
};

const modalStyles = StyleSheet.create({
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
    marginBottom: 20,
    backgroundColor: '#2196F3'
  },
});
