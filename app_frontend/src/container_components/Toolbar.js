import React from 'react';
import 'react-toastify/dist/ReactToastify.css';

import { ButtonComponent } from '../base_components/ButtonComponent';
import { toolbar_styles } from '../styles';

export const Toolbar = ({ onLeftButtonClick, onRightButtonClick }) => {

  return (
    <div
      testid="toolbar"
      style={toolbar_styles.toolbar}
    >
      <ButtonComponent
        id="FindGamesButton"
        title="Find Events" 
        onPress={onLeftButtonClick} 
        style={toolbar_styles.toolbarButtonLeft} 
      />
     <ButtonComponent
        id="CreateEventButton"
        title="Create Event" 
        onPress={onRightButtonClick} 
        style={toolbar_styles.toolbarButtonRight} 
      />
    </div>
  );
};
