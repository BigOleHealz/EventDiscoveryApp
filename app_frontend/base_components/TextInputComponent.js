// TextInputComponent.js
import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  Animated,
} from 'react-native';
import { common_styles, text_input_styles }  from '../styles';

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
    backgroundColor: common_styles.appTheme.backgroundColor, // Set background color to match the container
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
    <View style={[text_input_styles.container, { borderColor }, style]}>
      <Animated.Text style={inputLabelStyle}>{placeholder}</Animated.Text>
      <TextInput
        style={text_input_styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  );
};
