import React from 'react';

import { TextComponent } from './TextComponent';
import { button_styles } from '../styles';

export const ButtonComponent = ({
  title,
  onPress,
  style,
  icon,
  isMenuButton=false,
  ...props
}) => {
  const thisButtonStyle = isMenuButton
    ? button_styles.menu_button_styles
    : button_styles.clear_button_styles;

  // Merge styles
  const combinedStyle = {
    ...button_styles.standardButton,    
    ...thisButtonStyle,
    ...style
  };

  return (
    <button
      style={combinedStyle}
      onClick={onPress}  // Notice this change
      {...props}
    >
      {icon ? (
        <img src={icon} style={button_styles.icon} alt="button-icon"/>
      ) : (
        <TextComponent style={button_styles.button_text}>{title}</TextComponent>
      )}
    </button>
  );
};
