// TextInputComponent.js
import React from 'react';
import TextField from '@mui/material/TextField';

import { text_input_styles } from '../styles';

export const TextInputComponent = ({ label, id, required = false, style, value, onChangeText, ...props }) => {

  return (
      <TextField
        required={required}
        id={id}
        data-testid={id}
        label={label}
        value={value}
        onChange={onChangeText}
        InputLabelProps={{
          style: text_input_styles.inputLabel
        }}
        sx={{ padding: 0, borderRadius: 5, ...style }}
      />
  );
};

