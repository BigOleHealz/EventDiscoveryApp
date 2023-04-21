import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

import { CreateGameDateTimeModal } from '././CreateGameModal';
import { Button } from '../base_components/Button';
import pinIcon from '../assets/pin.png';


export const Map = ({ defaultCenter, pinPosition, onPinDragEnd, isCreateMode }) => {


    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [isModalMenuVisible, setIsModalMenuVisible] = useState(false);
    // Add this to your Map component in Map.js
    const [isInviteFriendsModalVisible, setIsInviteFriendsModalVisible] = useState(false);



    const mapRef = React.useRef();

    const onLoad = (map) => {
        mapRef.current = map;
    };

    const handlePinDragEnd = () => {
        const newCenter = mapRef.current.getCenter().toJSON();
        console.log('newCenter:', newCenter);
        setMapCenter(newCenter);
        onPinDragEnd(newCenter);
    };

    const handleBottomButtonClick = () => {
        setIsModalMenuVisible(!isModalMenuVisible);
    };

    return (
        <LoadScript
          id="script-loader"
          googleMapsApiKey="AIzaSyA__qBwVyEtvJ2DU7ioABpZ4zzK6keCBjo"
          language="en">
          <GoogleMap
            mapContainerStyle={map_styles.mapContainerStyle}
            zoom={15}
            center={mapCenter}
            onDragEnd={handlePinDragEnd}
            draggable={true}
            onLoad={onLoad}>
          </GoogleMap>
          {isCreateMode && <img id="create-game-pin-marker" src={pinIcon} alt="Pin" style={map_styles.pinStyle} />}
          {isCreateMode && (
            <Button id="select-date-time-button" onPress={handleBottomButtonClick} title="Open Modal" style={map_styles.bottomButtonStyle} />
          )}
          <CreateGameDateTimeModal isVisible={isModalMenuVisible} onRequestClose={() => setIsModalMenuVisible(false)} />
        </LoadScript>
      );
    };
    


const map_styles = StyleSheet.create({
    mapContainerStyle: {
        // height: '100%',
        flex: 1,
        width: '100%',
    },
    pinStyle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
    },
    bottomButtonStyle: {
        position: 'absolute',
        bottom: 20,
        left: '50%',
        height: 50,
        width: '30%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2196F3', // Add the color you want for the button background
        borderRadius: 4, // Add border radius as needed
        alignItems: 'center',
    },


});
