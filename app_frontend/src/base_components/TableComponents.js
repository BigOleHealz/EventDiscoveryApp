import React from 'react';
import { Button, ButtonGroup, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { common_styles, table_styles } from '../styles';

export const CheckboxTableComponent = ({
  rows,
  selected,
  setSelected
}) => {

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

  const isSelected = (id) => selected.includes(id);

  return (
    rows.length > 0 ?
      <TableContainer component={Paper}>
        <Table aria-label="checkbox table">
          <TableHead>
            <TableRow sx={{ backgroundColor: common_styles.defaultBackgroundColor }}>
              <TableCell align={'left'} sx={{ width: 'auto', padding: 0, ...table_styles.table_cell }}>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < rows.length}
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell align={'left'} sx={{ width: '100%', padding: 0, ...table_styles.table_cell }}>
                Select All
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={{ backgroundColor: common_styles.defaultBackgroundColor }}>
                <TableCell align={'left'} sx={{ width: 'auto', padding: 0, ...table_styles.table_cell }}>
                  <Checkbox
                    checked={isSelected(row.id)}
                    onChange={() => handleClick(row.id)}
                    style={{ color: row.checkboxColor || null }}
                  />
                </TableCell>
                <TableCell align={'left'} sx={{ width: '100%', padding: 0, ...table_styles.table_cell }}>
                  {row.label}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    : <></>
  );
};


export const AcceptDeclineTable = ({ rows }) => {

  const button_margins = { xs: "1px", sm: "2px", md: "3px", lg: "4px", xl: "5px" };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="accept-decline table">
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              style={{
                backgroundColor: common_styles.defaultBackgroundColor,
                borderBottom: 'none'
              }}
            >
              <TableCell
                align={'left'}
                sx={{
                  ...table_styles.table_cell
                }}
              >
                {row.name}
              </TableCell>
              <TableCell
                align={'right'}
                sx={{
                  ...table_styles.table_cell
                }}
              >
                <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                  <Button
                    onClick={() => row.onAccept(row)}
                    sx={{ marginRight: button_margins }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: '#FF0000',
                      color: '#FFFFFF',
                      marginLeft: button_margins
                    }}
                    onClick={() => row.onDecline(row)}
                  >
                    Decline
                  </Button>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
