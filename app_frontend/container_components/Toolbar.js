import React, { useState, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-toastify/dist/ReactToastify.css';

import friendsIcon from '../assets/friends-icon.png';
import notificationsIcon from '../assets/notifications-icon.png';
import { ButtonComponent } from '../base_components/ButtonComponent';
// import { EventInvitesPanel } from './EventInvitesPanel';
// import { FriendRequestsPanel } from './FriendRequestsPanel';
import styles from '../styles';

export const Toolbar = ({
  onLeftButtonClick,
}) => {

  const [toolbarHeight, setToolbarHeight] = useState(0);

  return (
    <>
      <View
        testID="toolbar"
        style={toolbar_styles.toolbar}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setToolbarHeight(height);
        }}
      >
        <ButtonComponent title="Find Events" onPress={onLeftButtonClick} style={toolbar_styles.toolbarButtonLeft} />
      </View>
    </>
  );
};

const toolbar_styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: styles.appTheme.backgroundColor,
    padding: 15,
  },
  toolbarComponent: {
    height: '100%',
  },
  toolbarButtonLeft: {
    paddingLeft: 10,
  },
  toolbarButtonRight: {
    paddingRight: 10,
  },
  centerView: {
    flex: 1,
    alignItems: 'center',
  },
  centeredButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerButton: {
    paddingHorizontal: 10,
  },
  icon: {
    height: 35,
    width: 35
  }
});
