import React from 'react';
import { ButtonComponent } from '../base_components/ButtonComponent';
import { iconSvgDataUrl } from '../utils/constants';
import { create_event_location_selector_styles } from '../styles';

export const CreateEventLocationSelector = ({ handleGetLocationCoordinates }) => {
  return (
    <>
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
    </>
  );
};
