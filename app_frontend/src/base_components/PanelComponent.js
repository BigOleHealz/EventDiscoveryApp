
import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

export default function PanelComponent({ children, anchor, isVisible, ...props }) {
  const [state, setState] = React.useState({
    [anchor]: isVisible,
  });

  React.useEffect(() => {
    setState({ ...state, [anchor]: isVisible });
  }, [isVisible]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <SwipeableDrawer
        anchor={anchor}
        open={state[anchor]}
        onClose={() => setState({ ...state, [anchor]: false })}
        onOpen={() => setState({ ...state, [anchor]: true })}
      >
        {children}
      </SwipeableDrawer>
    </Box>
  );
}
