import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import 'react-toastify/dist/ReactToastify.css';

import friendsIcon from '../assets/friends-icon.png';
import notificationsIcon from '../assets/notifications-icon.png';
import { ButtonComponent } from '../base_components/ButtonComponent';
// import { EventInvitesPanel } from './EventInvitesPanel';
// import { FriendRequestsPanel } from './FriendRequestsPanel';
import { toolbar_styles }  from '../styles';

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
