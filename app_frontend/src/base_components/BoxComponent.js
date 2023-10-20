import * as React from 'react';
import Box from "@mui/material/Box";
import { common_styles } from '../styles';

const BoxComponent = React.forwardRef((props, ref) => {
  const { children, style, ...otherProps } = props;
  
  return (
    <Box ref={ref} sx={{...common_styles.basicComponent, ...style}} {...otherProps}>
      {children}
    </Box>
  );
});

export default BoxComponent;
