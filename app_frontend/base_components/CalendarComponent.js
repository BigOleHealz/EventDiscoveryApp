import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { LoggerContext } from '../utils/Contexts';
import leftArrowImage from '../assets/horizontal_arrow_left.png';
import rightArrowImage from '../assets/horizontal_arrow_right.png';
import { calendar_styles }  from '../styles';

export const CalendarComponent = ({ selected, onDateSelected, style }) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(selected || currentDate);
  const { logger, setLogger } = React.useContext(LoggerContext);

  const renderArrow = (direction) => {
    if (direction === 'left') {
      return <Image source={leftArrowImage} style={calendar_styles.arrowStyle} />;
    } else if (direction === 'right') {
      return <Image source={rightArrowImage} style={calendar_styles.arrowStyle} />;
    }
  };

  return (
    <View style={calendar_styles.view}>
      <Calendar
        style={style} // Merge the default styles with the passed-in style
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          logger.info(`Date Selected: ${day.dateString}`);
          onDateSelected(day.dateString);
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            disableTouchEvent: true,
            selectedDotColor: 'orange',
          },
        }}
        renderArrow={renderArrow}
        theme={calendar_styles.theme}
      />
    </View>
  );
};
