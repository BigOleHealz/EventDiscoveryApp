import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


// import { CreateGameDateTimeModal, InviteFriendsModal } from './CreateGameModals';
import { ButtonComponent } from '../base_components/ButtonComponent';
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import AWSHandler from '../utils/AWSHandler';
import { useCypherQueryHandler, formatString } from '../db/DBHandler';
import { useReadCypher } from 'use-neo4j'
import { FETCH_EVENTS_FOR_MAP } from '../db/queries'

// import pinIcon from '../assets/pin.png';


const awsHandler = new AWSHandler();

export const Map = ({
  defaultCenter,
  isCreateGameMode,
    // setIsCreateGameMode,
    // createGameFunction 
  findGameSelectedDate,
  // findGameStartTime,
  // findGameEndTime,
  setFindGameSelectedDate,
  // setFindGameStartTime,
  // setFindGameEndTime,
}) => {

    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null); // Add this state to store the API key


    // Handle Map
    const mapRef = React.useRef();
    const onLoad = (map) => {
        console.log("Map onLoad")
        mapRef.current = map;
    };

    useEffect(() => {
        const fetchSecrets = async () => {
            const secrets = await awsHandler.getSecretValue('google_maps_api_key');
            if (secrets) {
                // Use the secrets, e.g., set the API key
                setGoogleMapsApiKey(secrets.GOOGLE_MAPS_API_KEY);
            }
        };
    
        fetchSecrets();
    }, []);

    // Handle Map Events
    const [map_events_full_day, setMapEventsFullDay] = useState([]);

    const start_timestamp = `${findGameSelectedDate}T00:00:00`;
    const end_timestamp = `${findGameSelectedDate}T23:59:59`;

    const {
      loading,
      error,
      records,
      run,
    } = useCypherQueryHandler(formatString(FETCH_EVENTS_FOR_MAP, start_timestamp, end_timestamp));
    
    useEffect(() => {
      console.log('findGameSelectedDate changed', findGameSelectedDate);
      run(); // Run the query when findGameSelectedDate changes
    }, [findGameSelectedDate]);
    
    useEffect(() => {
      if (!loading && !error && records) {
        console.log("queryResult", records);
        setMapEventsFullDay(records);
      }
    }, [loading, error, records]);
  
    
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
                    ],
                    }}
                
            >
            {Array.isArray(map_events_full_day) &&
              map_events_full_day.map((event) => (
                <MapMarkerWithTooltip
                  key={event.UUID}
                  event={event}
                  activePopup={activePopup}
                  onSetActivePopup={handleSetActivePopup}
                />
            ))}
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
