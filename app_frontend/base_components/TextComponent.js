// TextComponent.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../styles';

export const TextComponent = ({ children, style, align = 'center' }) => {
  return (
    <View style={{ justifyContent: align }}>
      <Text style={[styles.text_component, style]}>{children}</Text>
    </View>
  );
};
