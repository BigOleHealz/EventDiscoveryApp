import React, { useState } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, FlatList, CheckBox } from 'react-native';
import { CalendarComponent } from '../base_components/CalendarComponent';
import { CreateGameTimeSelectorComponent } from '../base_components/CreateGameTimeSelectorComponent';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { ModalComponent } from '../base_components/ModalComponent';

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
        style={create_game_datetime_styles.buttonStyle}
      />
    </ModalComponent>
  );
};


const create_game_datetime_styles = StyleSheet.create({
  buttonStyle: {
    marginBottom: 20,
  },
});


const FriendChecklistItem = ({ name, isChecked, onValueChange }) => {
  return (
    <View style={create_game_invite_friends_checklist_styles.itemContainer}>
      <CheckBox value={isChecked} onValueChange={onValueChange} />
      <Text style={create_game_invite_friends_checklist_styles.itemText}>{name}</Text>
    </View>
  );
};

export const InviteFriendsModal = ({ isVisible, onRequestClose, onSubmitButtonClick }) => {
  const friends = [
    { uuid: '1', name: 'Alice', isChecked: false },
    { uuid: '2', name: 'Bob', isChecked: false },
    { uuid: '3', name: 'Charlie', isChecked: false },
    { uuid: '4', name: 'Dave', isChecked: false },
    { uuid: '5', name: 'Eva', isChecked: false },
  ];

  const [anyChecked, setAnyChecked] = React.useState(false);

  const handleValueChange = (index, newValue) => {
    friends[index].isChecked = newValue;
    setAnyChecked(friends.some(friend => friend.isChecked));
  };

  const handleSubmitButtonClick = () => {
    const selectedFriendUUIDs = friends.filter(friend => friend.isChecked).map(friend => friend.uuid);
    console.log('Selected friends:', selectedFriendUUIDs);
    // if (onSubmitButtonClick) {
      onSubmitButtonClick(selectedFriendUUIDs);
    // }
  };

  return (
    <ModalComponent
      id="create-game-invite-friend-modal"
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={create_game_invite_friends_checklist_styles.titleText}>Invite Friends</Text>
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
      <ButtonComponent
        id="create-game-invite-friends-button"
        title={anyChecked ? "Send Invites & Create Game" : "Skip & Create Game"}
        onPress={handleSubmitButtonClick}
        style={create_game_invite_friends_checklist_styles.buttonStyle}
      />
    </ModalComponent>
  );
};

const create_game_invite_friends_checklist_styles = StyleSheet.create({
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
  },
});
