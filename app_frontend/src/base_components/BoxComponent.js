import * as React from 'react';
import Box from "@mui/material/Box";

import { common_styles } from '../styles';

export default function BoxComponent({ children, style }) {
  return (
    <Box sx={{...common_styles.basicComponent, ...style}} >
      {children}
    </Box>
  )
}