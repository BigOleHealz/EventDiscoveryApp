// TextInputComponent.js
import React, { useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';

export const TextInputComponent = ({ placeholder, style, ...props }) => {
//   const combinedStyles = StyleSheet.flatten([textInputStyles.input, style]);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');

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
    backgroundColor: 'rgba(0, 0, 0, 0)', // Set background color to transparent
    paddingHorizontal: 0, // Added padding to avoid cutting off the label text
  };
  

  return (
    <View style={[textInputStyles.container, { borderColor }, style]}>
      <Animated.Text style={inputLabelStyle}>{placeholder}</Animated.Text>
      <TextInput
        style={textInputStyles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChangeText={setValue}
        {...props}
      />
    </View>
  );
};

const textInputStyles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 4,
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    padding: 0,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    height: 40,
    color: styles.appTheme.color,
  },
});

