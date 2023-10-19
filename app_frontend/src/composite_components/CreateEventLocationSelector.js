import React, { useState } from 'react';
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { TextInputComponent } from '../base_components/TextInputComponent';
import { iconSvgDataUrl } from '../utils/constants';

import { common_styles } from '../styles';


const component_width = { xs: "120px", sm: "180px", md: "300px" }
const component_height = { xs: "40px", sm: "60px", md: "70px" }
const border_radius = { xs: "5px", sm: "10px", md: "15px" }

const icon_width = { xs: "48px", sm: "60px", md: "80px" }
const icon_height = { xs: "72px", sm: "90px", md: "120px" }
export const CreateEventLocationSelector = ({
  isVisible,
  handleGetLocationCoordinates,
  style,
  ...props
}) => {
  if (!isVisible) return null;
  const [location_text_input_value, setLocationTextInputValue] = useState('');

  const handleLocationTextInputChange = (event) => {
    console.log('handleLocationTextInputChange: event.target.value = ', event.target.value);
    setLocationTextInputValue(event.target.value);
  }

  return (
    <Box
      id="div-location-selector-vertical-container"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: { xs: "10px", sm: "15px", md: "20px" },
        paddingBottom: { xs: "20px", sm: "25px", md: "35px" },
      }}
    >
      <TextInputComponent
        id="text-input-create-event-location-selector"
        label="Location"
        value={location_text_input_value}
        onChangeText={handleLocationTextInputChange}
        style={{
          pointerEvents: 'auto',
          borderRadius: border_radius,
          width: component_width,
          height: component_height,
          ...common_styles.basicComponent,
        }}
      />
      <Avatar
        id="create-event-pin-marker"
        src={iconSvgDataUrl('#000')}
        alt="Pin"
        sx={{ 
          pointerEvents: 'auto', 
          alignSelf: 'center',
          width: icon_width,
          height: icon_height,
        }}
      />
      <Button
        id="button-create-event-set-location-coordinates"
        onClick={handleGetLocationCoordinates}
        sx={{
          pointerEvents: 'auto',
          borderRadius: border_radius,
          width: component_width,
          height: component_height,
          color: 'white',
          backgroundColor: common_styles.brightBlueColor
        }}
      >
        Set Location
      </Button>
    </Box>
  );
};

