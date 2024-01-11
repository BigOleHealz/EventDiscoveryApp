import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import BoxComponent from './BoxComponent';
import { getDateStringFromDateObject } from '../utils/HelperFunctions';
import { common_styles } from '../styles';

const theme = createTheme({
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: common_styles.appTheme.color,
        },
        daySelected: {
          color: 'white',
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          color: common_styles.appTheme.color,
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          color: common_styles.appTheme.color,
        },
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: common_styles.appTheme.color,
        },
      }
    },
  }
});

export function CalendarComponent({ ...props }) {

  const onChange = date => {
    const formatted_date = getDateStringFromDateObject(date);
    props.onDateSelected(formatted_date);
  };

  return (
    <BoxComponent >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <DateCalendar onChange={onChange} />
        </ThemeProvider>
      </LocalizationProvider>
    </BoxComponent>
  );
}
