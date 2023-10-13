// TextInputComponent.js
import React from 'react';
import TextField from '@mui/material/TextField';

import { text_input_styles } from '../styles';
// import '../css/TextInputComponentOverrides.css'

export const TextInputComponent = ({ label, id, required=false, style, value, onChangeText, ...props }) => {
 
  
  return (
    <div
      // style={{ ...style, position: 'relative', padding: '16px'}}
    >
      <div style={text_input_styles.container}>
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
        />
      </div>
    </div>
  );
};
