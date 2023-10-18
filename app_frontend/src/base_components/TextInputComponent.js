// TextInputComponent.js
import React from 'react';
import TextField from '@mui/material/TextField';

import { text_input_styles } from '../styles';

export const TextInputComponent = ({ label, id, required=false, style, value, onChangeText, ...props }) => {

  // Merge default styles with any additional styles passed as a parameter
  const mergedStyles = { ...text_input_styles.container, ...style };
  return (
    <div style={mergedStyles}>
      <TextField
        required={required}
        id={id}
        data-testid={id}
        label={label}
        value={value}
        onChange={onChangeText}
        inputProps={{ style: text_input_styles.input }}
        InputLabelProps={{
          style: text_input_styles.inputLabel
        }}
        props={props}
      />
    </div>
  );
};

