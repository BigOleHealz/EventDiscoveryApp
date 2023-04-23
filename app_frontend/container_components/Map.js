import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

import { CreateGameDateTimeModal, InviteFriendsModal } from './CreateGameModals';
import { ButtonComponent } from '../base_components/ButtonComponent';
import pinIcon from '../assets/pin.png';


export const Map = ({ defaultCenter, isCreateGameMode, setIsCreateGameMode, createGameFunction }) => {

    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible] = useState(false);
    const [isInviteFriendsModalVisible, setIsInviteFriendsModalVisible] = useState(false);

    // Handle Create Game vars
    const [create_game_location, setCreateGameLocation] = useState(null);
    const [create_game_date_time, setCreateGameDateTime] = useState(null);
    const [create_game_friend_invite_list, setCreateGameFriendInviteList] = useState([]);


    const mapRef = React.useRef();

    const onLoad = (map) => {
        mapRef.current = map;
    };


    const handleCreateGameSelectLocationClick = () => {
        setCreateGameLocation(mapRef.current.getCenter().toJSON());
        setIsCreateGameDateTimeModalVisible(!isCreateGameDateTimeModalVisible);
    };

    const handleCreateGameSelectDateTimeButtonClick = (selected_datetime) => {
        setCreateGameDateTime(selected_datetime);
        setIsCreateGameDateTimeModalVisible(false);
        setIsInviteFriendsModalVisible(true);
    };

    const handleInviteFriendsButtonClick = (friend_invite_list) => {
        setCreateGameFriendInviteList(friend_invite_list);
        // console.log("create_game_location:", create_game_location)
        // console.log("create_game_date_time", create_game_date_time)
        // console.log("create_game_friend_invite_list", create_game_friend_invite_list);

        if (typeof createGameFunction === 'function') {
            createGameFunction(create_game_location, create_game_date_time, create_game_friend_invite_list);
        }

        setIsInviteFriendsModalVisible(false);
        setIsCreateGameMode(false);
    };

    return (
        <LoadScript
            id="script-loader"
            googleMapsApiKey=""
            language="en">
            <GoogleMap
                mapContainerStyle={map_styles.mapContainerStyle}
                zoom={15}
                center={mapCenter}
                // onDragEnd={handlePinDragEnd}
                draggable={true}
                onLoad={onLoad}>
            </GoogleMap>
            {isCreateGameMode && <img id="create-game-pin-marker" src={pinIcon} alt="Pin" style={map_styles.pinStyle} />}
            {isCreateGameMode && (
                <ButtonComponent id="create-game-datetime-button" onPress={handleCreateGameSelectLocationClick} title="Set Game Location" style={map_styles.bottomButtonStyle} />
            )}
            <CreateGameDateTimeModal
                isVisible={isCreateGameDateTimeModalVisible}
                onRequestClose={() => setIsCreateGameDateTimeModalVisible(false)}
                onSubmitButtonClick={handleCreateGameSelectDateTimeButtonClick}
            />

            <InviteFriendsModal
                isVisible={isInviteFriendsModalVisible}
                onRequestClose={() => setIsInviteFriendsModalVisible(false)}
                onSubmitButtonClick={handleInviteFriendsButtonClick}
            />
        </LoadScript>
    );
};


const map_styles = StyleSheet.create({
    mapContainerStyle: {
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
        backgroundColor: '#2196F3',
        borderRadius: 4,
        alignItems: 'center',
    },
});
