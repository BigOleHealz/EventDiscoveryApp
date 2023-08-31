import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

import { TextComponent } from './TextComponent';
import { button_styles } from '../styles';

export const ButtonComponent = ({
  title,
  onPress,
  style,
  icon,
  isMenuButton,
}) => {
  const thisButtonStyle = isMenuButton
    ? button_styles.menu_button_styles
    : button_styles.clear_button_styles;

  return (
    <TouchableOpacity
      style={[button_styles.standardButton, thisButtonStyle, style]}
      onPress={onPress}
    >
      {icon ? (
        <Image source={icon} style={button_styles.icon} />
      ) : (
        <TextComponent style={button_styles.button_text}>{title}</TextComponent>
      )}
    </TouchableOpacity>
  );
};
