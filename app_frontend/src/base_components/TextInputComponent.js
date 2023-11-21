// TextInputComponent.js
import React from 'react';
import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import { text_input_styles } from '../styles';

const theme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          padding: 0,
        },
      },
    }
  }
});
export const TextInputComponent = ({ label, id, required = false, style, sx, value, onChangeText, ...props }) => {

  return (
    <ThemeProvider theme={theme} >
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
        InputProps={{
          style: text_input_styles.input
        }}
        sx={{
          padding: 0,
          borderRadius: 5,
          ...style,
          ...sx
        }}
      />
      </ThemeProvider>
  );
};

