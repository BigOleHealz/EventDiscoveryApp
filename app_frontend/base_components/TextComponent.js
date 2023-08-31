// TextComponent.js
import React from 'react';
import { View, Text } from 'react-native';
import { text_component_styles }  from '../styles';

export const TextComponent = ({ children, style, align = 'center' }) => {
  return (
    <View style={{ justifyContent: align }}>
      <Text style={[text_component_styles.view, style]}>{children}</Text>
    </View>
  );
};
