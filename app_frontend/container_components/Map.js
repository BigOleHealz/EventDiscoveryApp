import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { useReadCypher, useWriteCypher } from 'use-neo4j';
import uuid from 'react-native-uuid';
import { add, format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import { CreateGameDateTimeModal, InviteFriendsModal } from './CreateGameModals';
import { ButtonComponent } from '../base_components/ButtonComponent';
import MapMarkerWithTooltip from './MapMarkerWithTooltip';

import { recordsAsObjects } from '../db/DBHandler';
import { FETCH_EVENTS_FOR_MAP, CREATE_EVENT } from '../db/queries'
import { day_start_time, day_end_time, date_time_format } from '../utils/constants';
import { getAddressFromCoordinates } from '../utils/HelperFunctions';
import { useJoinGame } from '../hooks/JoinGameHook';
import pinIcon from '../assets/pin.png';


export const Map = ({
  isCreateGameMode,
  setIsCreateGameMode,
  findGameSelectedDate,
  findGameStartTime,
  findGameEndTime,
  awsHandler,
  userSession
}) => {

    // Handle Map
    const defaultCenter = {
      lat: 39.9526,
      lng: -75.1652,
    };
  
    const { joinGame } = useJoinGame(userSession);

    const [isCreateGameDateTimeModalVisible, setIsCreateGameDateTimeModalVisible] = useState(false);
    const [isInviteFriendsModalVisible, setIsInviteFriendsModalVisible] = useState(false);

    // Handle Create Game vars
    const [create_game_location, setCreateGameLocation] = useState(null);
    const [create_game_date_time, setCreateGameDateTime] = useState(null);
    const [runCreateEventQuery, setRunCreateEventQuery] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(false);

    const [create_game_friend_invite_list, setCreateGameFriendInviteList] = useState([]);
    const { loading: createEventLoading, error: createEventError, result: createEventResult, run: runWrite } = useWriteCypher(CREATE_EVENT);


    const resetCreateGameDetails = () => {
      setCreateGameLocation(null);
      setCreateGameDateTime(null);
      setCreateGameFriendInviteList(null);
    };

    useEffect(() => {
      const createGame = async () => {
        if (runCreateEventQuery) {
          const user_session = userSession;
          const address = await getAddressFromCoordinates(create_game_location.lat, create_game_location.lng, googleMapsApiKey);
    
          const params = {
            CreatedByID: user_session.UUID,
            Address: address,
            StartTimestamp: create_game_date_time,
            Host: user_session.Username,
            EventCreatedAt: format(new Date(), date_time_format),
            Lon: create_game_location.lng,
            PublicEventFlag: true,
            EndTimestamp: format(add(new Date(create_game_date_time), { hours: 1 }), date_time_format),
            EventName: 'Pickup Basketball',
            UUID: uuid.v4(),
            Lat: create_game_location.lat,
            FriendInviteList: create_game_friend_invite_list
          };
          console.log('params', params);
          runWrite(params);

          setRunCreateEventQuery(false);
          setTransactionStatus(true);
        }
      };
      createGame();
    },  [runCreateEventQuery]);

    useEffect(() => {
      if (createEventLoading && transactionStatus) {
          setTransactionStatus('loading');
      }  else if (createEventResult && transactionStatus) {
          setTransactionStatus('success');
          toast.success('Transaction successful!');
          if (createEventError) {
            createEventError = null;
          }
          resetCreateGameDetails();
          setTransactionStatus(false);
      } else if (createEventError && transactionStatus) {
          setTransactionStatus('error');
          toast.error(`Error: ${createEventError.message}`);
          resetCreateGameDetails();
          setTransactionStatus(false);
      }
    }, [createEventLoading, createEventError, createEventResult, transactionStatus]);
    
    // Handle Map
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [googleMapsApiKey, setGoogleMapsApiKey] = useState(null); // Add this state to store the API key
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
    const mapRef = React.useRef();
    const onLoad = (map) => {
        mapRef.current = map;
    };

    // Handle Map Events
    const [map_events_full_day, setMapEventsFullDay] = useState([]);
    const [map_events_filtered, setMapEventsFiltered] = useState([]);

    const start_timestamp = `${findGameSelectedDate}T${day_start_time}`;
    const end_timestamp = `${findGameSelectedDate}T${day_end_time}`;

    const {
      loading,
      error,
      records,
      run,
    } = useReadCypher(FETCH_EVENTS_FOR_MAP);

    useEffect(() => {
      console.log('findGameSelectedDate changed', findGameSelectedDate);
      const params = {
        start_timestamp: start_timestamp,
        end_timestamp: end_timestamp
      }
      run(params); // Run the query when findGameSelectedDate changes
    }, [findGameSelectedDate, transactionStatus=== false]);
    
    useEffect(() => {
      if (!loading && !error && records) {
        const mapEventsObjectList = recordsAsObjects(records)
        console.log('records_fetch_events_for_map:', mapEventsObjectList);
        setMapEventsFullDay(mapEventsObjectList);

      }
    }, [loading, error, records]);
  
    
    useEffect(() => {
      const filteredEvents = map_events_full_day.filter(event => {
        const eventTimestamp = new Date(event.StartTimestamp);
        const startTime = new Date(`${findGameSelectedDate}T${findGameStartTime}`);
        const endTime = new Date(`${findGameSelectedDate}T${findGameEndTime}`);

        return eventTimestamp >= startTime && eventTimestamp <= endTime;
      });
      
      setMapEventsFiltered(filteredEvents);
    }, [findGameStartTime, findGameEndTime, map_events_full_day]);
  
    
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
        setRunCreateEventQuery(true);
        setIsInviteFriendsModalVisible(false);
        setIsCreateGameMode(false);
    };

    const handleJoinGameButtonClick = (uuid) => {
      console.log("handleJoinGameButtonClick", uuid);
      joinGame(uuid);
    };
    

    if (!googleMapsApiKey) {
        return (
            <View>
                <Text>Loading...</Text>
            </View>
        )
      }
    
    return (
      <>
        <LoadScript
            id="script-loader"
            googleMapsApiKey={googleMapsApiKey}
            language="en">
            <GoogleMap
                mapContainerStyle={map_styles.mapContainerStyle}
                zoom={15}
                center={mapCenter}
                draggable={true}
                onLoad={onLoad}
                options={{
                    styles: [{
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        }],
                    }}
            >
            {Array.isArray(map_events_filtered) &&
              map_events_filtered.map((event) => (
                <MapMarkerWithTooltip
                  key={event.UUID}
                  event={event}
                  activePopup={activePopup}
                  onSetActivePopup={handleSetActivePopup}
                  onJoinGameButtonClick={handleJoinGameButtonClick}
                />
            ))}
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
                friendList={userSession.Friends}
                onRequestClose={() => setIsInviteFriendsModalVisible(false)}
                onSubmitButtonClick={handleInviteFriendsButtonClick}
            />
        </LoadScript>
      <ToastContainer />
      </>
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
