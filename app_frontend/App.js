import React, { useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import styles from './styles';
import { GoogleMap, LoadScript } from '@react-google-maps/api';


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

const SidePanel = ({ isVisible, side }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isVisible]);

  const panelPosition = side === 'left'
    ? { left: slideAnim.interpolate({ inputRange: [0, 1], outputRange: ['-30%', '0%'] }) }
    : { right: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [isVisible ? '-30%' : '100%', '0%'] }) };

  return isVisible ? (
    <Animated.View style={[styles.sidePanel, side === 'left' ? styles.leftPanel : styles.rightPanel, panelPosition]}>
      <Text>{side === 'left' ? 'Left Panel' : 'Right Panel'}</Text>
    </Animated.View>
  ) : null;
};

const Map = () => {
  const mapContainerStyle = {
    height: '100%',
    width: '100%',
  };

  const defaultCenter = {
    lat: 40.730610,
    lng: -73.935242,
  };

  return (
    <LoadScript
      id="script-loader"
      googleMapsApiKey="<google_maps_api_key"
      language="en"
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={defaultCenter}
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
        <View style={styles.panelsContainer}>
          <SidePanel isVisible={isLeftPanelVisible} side="left" />
          <SidePanel isVisible={isRightPanelVisible} side="right" />
        </View>
      </View>
    </View>
  );

}
