// TextInputComponent.js
import React, { useState } from 'react';

export const TextInputComponent = ({ placeholder, style, value, onChangeText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const borderColor = isFocused ? '#2196F3' : 'gray';
  
  const inputLabelStyle = {
    position: 'absolute',
    left: 8,
    backgroundColor: '#fff',  // Set background color to match the container
    padding: '0 4px',  // Add padding to create a background around the text
    top: isFocused || value ? '-8px' : '12px',
    fontSize: isFocused || value ? '12px' : '16px',
    color: isFocused || value ? '#2196F3' : 'gray',
  };
  
  return (
    <div style={{ ...style, borderColor, position: 'relative', padding: '16px', border: '1px solid' }}>
      <div style={inputLabelStyle}>{placeholder}</div>
      <input
        type="text"
        style={{ width: '100%', border: 'none', outline: 'none' }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        value={value}
        onChange={e => onChangeText(e.target.value)}
        {...props}
      />
    </div>
  );
};
