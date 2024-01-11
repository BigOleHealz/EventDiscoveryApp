import React from 'react';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import { TextComponent } from '../base_components/TextComponent';
import { select_interests_scrollview_styles } from '../styles';

export const SwitchComponent = ({ id, label, checked=false, onChange }) => {
  return (
    <Box style={select_interests_scrollview_styles.switchContainer}>
      <Switch
        data-testid={id}
        // Testid={id}
        label={label}
        checked={checked}
        onChange={onChange}
      />
      <TextComponent style={select_interests_scrollview_styles.switchLabel}>
        {label}
      </TextComponent>
    </Box>
  );
};
