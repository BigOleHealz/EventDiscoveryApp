import React from 'react';
import { Box, Button, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { common_styles, table_styles } from '../styles';

export const CheckboxTableComponent = ({
  rows,
  selected,
  setSelected
}) => {

  const isSelected = (id) => selected.includes(id);

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? rows.map((row) => row.id) : []);
  };

  const handleClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  return (
    rows.length > 0 ?
      <TableContainer component={Paper} sx={table_styles.table_container}>
        <Table aria-label="checkbox table">
          <TableHead>
            <TableRow sx={table_styles.row}>
              <TableCell sx={table_styles.checkbox_cell}>
                <Checkbox
                  label='checkbox-select-all'
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell sx={table_styles.label_cell}>
                Select All
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={table_styles.row}>
                <TableCell sx={table_styles.checkbox_cell}>
                  <Checkbox
                    checked={isSelected(row.id)}
                    onChange={() => handleClick(row.id)}
                    style={{ color: row.checkboxColor || null, marginLeft: '10px' }}
                  />
                </TableCell>
                <TableCell sx={table_styles.label_cell}>
                  {row.label}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      : <Box>No content to display</Box>
  );
};


export const AcceptDeclineTable = ({ rows }) => {

  const button_margins = { xs: "1px", sm: "2px", md: "3px", lg: "4px", xl: "5px" };

  return (
    rows.length > 0 ?
      <TableContainer component={Paper} sx={table_styles.table_container} >
        <Table aria-label="accept-decline table">
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={table_styles.row}>
                <TableCell sx={table_styles.item_cell}>
                  <Box>
                    {row.content}
                  </Box>
                </TableCell>
                <TableCell 
                  align={'right'} sx={table_styles.accept_decline_cell}>
                  <Box sx={{ display: 'block' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => row.onAccept(row)}
                      sx={{ marginBottom: button_margins, width: '100px' }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: '#FF0000',
                        color: '#FFFFFF',
                        marginTop: button_margins,
                        width: '100px'
                      }}
                      onClick={() => row.onDecline(row)}
                    >
                      Decline
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      : <Box>No content to display</Box>
  );
};
