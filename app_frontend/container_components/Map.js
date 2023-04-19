import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { StyleSheet } from 'react-native';

export const Map = () => {
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
            googleMapsApiKey="AIzaSyB8Bh-g3zdnKDVZYlvhKwjpNXr5k9LB1h0"
            language="en">
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


const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});
