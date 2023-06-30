// TextInputComponent.js
import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import styles from '../styles';

export const TextInputComponent = ({ placeholder, style, value, onChangeText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  const animatedFocus = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const borderColor = isFocused ? '#2196F3' : 'gray';

  React.useEffect(() => {
    Animated.timing(animatedFocus, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const inputLabelStyle = {
    position: 'absolute',
    left: 8,
    backgroundColor: styles.appTheme.backgroundColor, // Set background color to match the container
    paddingHorizontal: 4, // Add padding to create a background around the text
    top: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [12, isFocused || value ? -8 : 12],
    }),
    fontSize: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedFocus.interpolate({
      inputRange: [0, 1],
      outputRange: ['gray', '#2196F3'],
    }),
  };

  return (
    <View style={[textInputStyles.container, { borderColor }, style]}>
      <Animated.Text style={inputLabelStyle}>{placeholder}</Animated.Text>
      <TextInput
        style={textInputStyles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
};

const textInputStyles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    padding: 0,
    margin: 10
  },
  input: {
    fontSize: 16,
    height: 40,
    color: styles.appTheme.color,
    borderColor: 'rgba(0, 0, 0, 0)', // Set border color to transparent to avoid overlapping
    outlineWidth: 0, // Remove outline 
  },
});
