import React from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';

import { TextComponent } from './TextComponent';
import styles from '../styles';

const button_styles = styles.buttons;

export const ButtonComponent = ({
  title,
  onPress,
  style,
  icon,
  isMenuButton,
}) => {
  const buttonStyle = isMenuButton
    ? button_styles.menu_button_styles
    : button_styles.clear_button_styles;

  return (
    <TouchableOpacity
      style={[button_styles.standardButton, buttonStyle, style]}
      onPress={onPress}
    >
      {icon ? (
        <Image source={icon} style={buttonStyles.icon} />
      ) : (
        <TextComponent style={button_styles.button_text}>{title}</TextComponent>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  icon: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
  },
});
