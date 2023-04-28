import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// import isEqual from 'lodash.isequal';


// import { CreateGameDateTimeModal, InviteFriendsModal } from './CreateGameModals';
import { ButtonComponent } from '../base_components/ButtonComponent';
// import MapMarkerWithTooltip from './MapMarkerWithTooltip';

// import AWSHandler from '../utils/AWSHandler';
// import { CypherQueryHandler } from '../db/DBHandler';
// import { FETCH_EVENTS_FOR_MAP } from '../db/queries'

// import pinIcon from '../assets/pin.png';


// const awsHandler = new AWSHandler();

export const Map = ({
    defaultCenter,
    isCreateGameMode,
    // setIsCreateGameMode,
    // createGameFunction 
}) => {

    const [mapCenter, setMapCenter] = useState(defaultCenter);
    // const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null); // Add this state to store the API key
    const googleMapsApiKey = "";

    const [isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible] = useState(false);
    const [isInviteFriendsModalVisible, setIsInviteFriendsModalVisible] = useState(false);

    // Handle Create Game vars
    const [create_game_location, setCreateGameLocation] = useState(null);
    const [create_game_date_time, setCreateGameDateTime] = useState(null);
    const [create_game_friend_invite_list, setCreateGameFriendInviteList] = useState([]);

    const [events, setEvents] = useState([]);




    // const queryResult = CypherQueryHandler({cypher: FETCH_EVENTS_FOR_MAP});
    // console.log('queryResult:', queryResult)
    // // Update events based on the response from CypherQueryHandler
    // useEffect(() => {
    //     if (queryResult) {
    //       setEvents((prevEvents) => {
    //         // Only update the events state if the queryResult is different from the previous state
    //         if (!isEqual(queryResult, prevEvents)) {
    //           return queryResult;
    //         }
    //         // If they are equal, return the previous state without any change
    //         return prevEvents;
    //       });
    //     }
    //   }, [queryResult]);


    const mapRef = React.useRef();

    const onLoad = (map) => {
        mapRef.current = map;
    };
    // useEffect(() => {
    //     const fetchSecrets = async () => {
    //         const secrets = await awsHandler.getSecretValue('google_maps_api_key');
    //         if (secrets) {
    //             // Use the secrets, e.g., set the API key
    //             setGoogleMapsApiKey(secrets.GOOGLE_MAPS_API_KEY);
    //         }
    //     };
    
    //     fetchSecrets();
    // }, []);
    
    // Manage map popup
    const [activePopup, setActivePopup] = useState(null);
    const handleSetActivePopup = (uuid) => {
        if (activePopup === uuid) {
          setActivePopup(null);
        } else {
          setActivePopup(uuid);
        }
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
        if (typeof createGameFunction === 'function') {
            createGameFunction(create_game_location, create_game_date_time, create_game_friend_invite_list);
        }

        setIsInviteFriendsModalVisible(false);
        setIsCreateGameMode(false);
    };

    if (!googleMapsApiKey) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
      }

    return (
        <LoadScript
            id="script-loader"
            googleMapsApiKey={googleMapsApiKey}
            language="en">
            <GoogleMap
                mapContainerStyle={map_styles.mapContainerStyle}
                zoom={15}
                center={mapCenter}
                // onDragEnd={handlePinDragEnd}
                draggable={true}
                onLoad={onLoad}
                options={{
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        }
                    ]
                }}>
            {/* {Array.isArray(events) &&
              events.map((event) => (
                <MapMarkerWithTooltip
                  key={event.UUID}
                  event={event}
                  activePopup={activePopup}
                  onSetActivePopup={handleSetActivePopup}
                />
            ))} */}
            </GoogleMap>
            {isCreateGameMode && <img id="create-game-pin-marker" src={pinIcon} alt="Pin" style={map_styles.pinStyle} />}
            {isCreateGameMode && (
                <ButtonComponent id="create-game-datetime-button" onPress={handleCreateGameSelectLocationClick} title="Set Game Location" style={map_styles.bottomButtonStyle} />
            )}
            {/* <CreateGameDateTimeModal
                isVisible={isCreateGameDateTimeModalVisible}
                onRequestClose={() => setIsCreateGameDateTimeModalVisible(false)}
                onSubmitButtonClick={handleCreateGameSelectDateTimeButtonClick}
            />

            <InviteFriendsModal
                isVisible={isInviteFriendsModalVisible}
                onRequestClose={() => setIsInviteFriendsModalVisible(false)}
                onSubmitButtonClick={handleInviteFriendsButtonClick}
            /> */}
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
