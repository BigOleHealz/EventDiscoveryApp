import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import styles from './styles';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { LeftSidePanel, RightSidePanel } from './container_components/SidePanels';


console.log('Big Ol Healz');

const Toolbar = ({ onLeftButtonClick, onRightButtonClick }) => (
  <View style={styles.toolbar}>
    <TouchableOpacity style={styles.toolbarButtonLeft} onPress={onLeftButtonClick}>
      <Text style={styles.toolbarButtonText}>Find Games</Text>
    </TouchableOpacity>
    <Text style={styles.toolbarTitle}>Home Screen</Text>
    <TouchableOpacity style={styles.toolbarButtonRight} onPress={onRightButtonClick}>
      <Text style={styles.toolbarButtonText}>Create Game</Text>
    </TouchableOpacity>
  </View>
);


const Map = () => {
  const mapContainerStyle = {
    height: '100%',
    width: '100%',
  };

  const defaultCenter = {
    lat: 40.730610,
    lng: -73.935242,
  };

  const [center, setCenter] = useState(defaultCenter);

  // const handleDragEnd = () => {
  //   const newCenter = mapRef.current.getCenter().toJSON();
  //   setCenter(newCenter);
  // };

  const mapRef = React.useRef();

  const onLoad = (map) => {
    mapRef.current = map;
  };

  return (
    <LoadScript
      id="script-loader"
      googleMapsApiKey=""
      language="en"
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        // onDragEnd={handleDragEnd}
        draggable={true}
        onLoad={onLoad}
      />
    </LoadScript>
  );
};


export default function App() {
  const [isLeftPanelVisible, setIsLeftPanelVisible] = useState(false);
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  const handleLeftButtonClick = () => {
    setIsLeftPanelVisible(!isLeftPanelVisible);
    setIsRightPanelVisible(false);
  };

  const handleRightButtonClick = () => {
    setIsRightPanelVisible(!isRightPanelVisible);
    setIsLeftPanelVisible(false);
  };

  return (
    <View style={styles.container}>
      <Toolbar onLeftButtonClick={handleLeftButtonClick} onRightButtonClick={handleRightButtonClick} />
      <View style={styles.fullScreen}>
        <Map />
        <LeftSidePanel isVisible={isLeftPanelVisible} />
        <RightSidePanel isVisible={isRightPanelVisible} />
      </View>
    </View>
  );
}
