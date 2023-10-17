import React, { useState } from 'react';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { TextInputComponent } from '../base_components/TextInputComponent';
import { iconSvgDataUrl } from '../utils/constants';

import { create_event_location_selector_styles } from '../styles';

// import '../css/locationselectorOverrides.css';

export const CreateEventLocationSelector = ({ handleGetLocationCoordinates }) => {

  const [ location_text_input_value, setLocationTextInputValue ] = useState('');

  // const handleLocationTextInputChange = (event) => {
  //   console.log('handleLocationTextInputChange: event.target.value = ', event.target.value);
  //   setLocationTextInputValue(event.target.value);
  // }

  return (
    <div id="div-location-selector" style={create_event_location_selector_styles.container}>
      {/* <TextInputComponent
        id="text-input-create-event-location-selector"
        label="Location"
        value={location_text_input_value}
        onChangeText={handleLocationTextInputChange}
        style={create_event_location_selector_styles.input_location_text_component_styles}
      /> */}
      <img
        id="create-event-pin-marker"
        src={iconSvgDataUrl('#000')}
        alt="Pin"
        style={create_event_location_selector_styles.pinStyle}
      />
      <ButtonComponent
        id="button-create-event-set-location-coordinates"
        title="Get Center Coordinates"
        onPress={handleGetLocationCoordinates}
        style={create_event_location_selector_styles.submitCoordinatesButtonStyle}
      />
    </div>
  );
};
