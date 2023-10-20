import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { storeUserSession } from './SessionManager';


export const useFetchUsername = (fetching_username_is_taken, username, setFetchingUsernameExists, setCreateUserProfileContext, create_user_profile_context, onUsernameAvailable) => {
  useEffect(() => {
    if (fetching_username_is_taken) {
      fetch('/api/is_username_taken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (data) {
            if (data.usernameExists === true) {
              const message = `Username is taken!`;
              toast.error(message);
              console.error(message);
            } else {
              const message = `Username is available!`;
              toast.success(message);
              console.log(message);
              setCreateUserProfileContext({
                ...create_user_profile_context,
                Username: username,
                UUID: uuidv4(),
              });
              onUsernameAvailable();
            }
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while checking if username exists!');
        });
    }
    setFetchingUsernameExists(false);
  }, [fetching_username_is_taken]);
};

export const useCreateEventNode = (is_creating_event_node, create_event_context, setIsCreatingEventNode, setCreateEventStage) => {
  useEffect(() => {
    if (is_creating_event_node) {
      console.log('create_event_context:', create_event_context)
      fetch('/api/create_event_node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...create_event_context })
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.success) {
            toast.success('Event Created Successfully!');
            setCreateEventStage(0);
          } else {
            toast.error('Failed to create Event: ' + (data.message || 'Unknown error'));
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while creating Event!');
        });
    }
    setIsCreatingEventNode(false);
  }, [is_creating_event_node]);
};

export const useCreatePersonNode = (is_creating_person_node, create_user_profile_context, setIsCreatingPersonNode, navigate) => {
  useEffect(() => {
    if (is_creating_person_node) {
      console.log('create_user_profile_context:', create_user_profile_context)
      fetch('/api/create_person_node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: create_user_profile_context.Username,
          Email: create_user_profile_context.Email,
          FirstName: create_user_profile_context.FirstName,
          LastName: create_user_profile_context.LastName,
          InterestUUIDs: create_user_profile_context.InterestUUIDs,
          UUID: create_user_profile_context.UUID
        })
      }).then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.success) {
            toast.success('Account Created Successfully!');
            navigate('/login');
          } else {
            toast.error('Failed to create account: ' + (data.message || 'Unknown error'));
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while creating user profile!');
        });
    }
    setIsCreatingPersonNode(false);
  }, [is_creating_person_node]);
};

export const useFetchEvents = (fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setFetchingEvents) => {
  useEffect(() => {
    if (fetching_events) {
      fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_timestamp: start_timestamp,
          end_timestamp: end_timestamp,
        }),
      }).then(res => res.json())
        .then(data => {
          setMapEventsFullDay(data);
        }).catch((error) => {
          console.error('Error:', error);
        });
      setFetchingEvents(false);
    }
  }, [fetching_events, start_timestamp, end_timestamp, setMapEventsFullDay, setFetchingEvents]);
};

export const useFetchEventTypes = (first_run, setFirstRun, setEventTypes, event_types_selected, setEventTypesSelected) => {
  useEffect(() => {
    if (first_run) {
      fetch('/api/get_event_type_mappings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(data => {
          console.debug('hook-event_types_selected:', event_types_selected)
          console.debug('event_type_mappings:', data);
          let eventTypeList;
          if (event_types_selected) {
            eventTypeList = data.map((eventType) => {
              return {
                ...eventType,
                isChecked: event_types_selected.includes(eventType.UUID)
              };
            });
          } else {
            eventTypeList = data.map((eventType) => {
              return {
                ...eventType,
                isChecked: false
              };
            });
          }
          setEventTypes(eventTypeList);
          setFirstRun(false);
        })
        .catch((error) => {
          toast.error(`Error Getting Event Types: ${error}`);
          console.error(error);
          setFirstRun(false);
        });
    }
  }, [first_run, event_types_selected]);
};

export const useFetchGoogleMapsApiKey = (
  fetching_google_maps_api_key,
  setGoogleMapsApiKey,
  setFetchingGoogleMapsApiKey,
) => {
  useEffect(() => {
    if (fetching_google_maps_api_key) {
      fetch('/api/get_aws_secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_id: 'google_maps_api_key',
        }),
      }).then(res => res.json())
        .then(data => {
          if (data) {
            setGoogleMapsApiKey(data.GOOGLE_MAPS_API_KEY);
          }
        }).catch((error) => {
          console.error('Error:', error);
        });
      setFetchingGoogleMapsApiKey(false);
    }
  }, [
    fetching_google_maps_api_key,
    setGoogleMapsApiKey,
    setFetchingGoogleMapsApiKey,
  ]);
};

export const useFetchGoogleProfile = (
  fetching_google_profile,
  setFetchingGoogleProfile,
  google_access_token,
  setUserAuthContext,
) => {
  useEffect(() => {
    if (fetching_google_profile) {
      fetch('/api/get_google_profile', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${google_access_token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          access_token: google_access_token
        })
      }).then(res => res.json())
        .then(data => {
          if (data) {
            toast.success('google account retrieved!');
            setUserAuthContext({
              FirstName: data.given_name,
              LastName: data.family_name,
              Email: data.email
            });
            console.log(data)
          } else {
            toast.error('failed to retrieve google account' + (data.message || 'Unknown error'));
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while retrieving google account!');
        });
    }
    setFetchingGoogleProfile(false);
  }, [fetching_google_profile]);
};

export const useSetGoogleClientId = (fetching_google_client_id, setFetchingGoogleClientId, setGoogleClientId) => {
  useEffect(() => {
    if (fetching_google_client_id) {
      fetch('/api/get_aws_secret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret_id: 'google_oauth_credentials',
        }),
      }).then(res => res.json())
        .then(data => {
          if (data) {
            setGoogleClientId(data.client_id);
          }
        }).catch((error) => {
          console.error('Error:', error);
        });
      setFetchingGoogleClientId(false);
    }
  }, [fetching_google_client_id]);
};

export const useAuthenticateUser = (
  user_auth_context,
  setCreateUserProfileContext,
  setUserSession,
  resetLoginInfo,
  // logger
) => {
  const navigate = useNavigate();

  console.log('user_auth_context:', user_auth_context)
  useEffect(() => {
    if (!user_auth_context) {
      return;
    }

    const email = user_auth_context.Email;
    if (email) {
      fetch('/api/get_user_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      }).then(res => res.json())
        .then(data => {
          if (!data || data.length === 0) {
            toast.success('Welcome New User!');
            console.log('No user data returned for email:', email);
            setCreateUserProfileContext(user_auth_context);
            navigate('/create-account');
            return;
          } else {
            const user_session_data = data;
            user_session_data.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            storeUserSession(user_session_data, setUserSession);
            toast.success('Login Successful!');
          }
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while fetching user profile!');
        });
    }
  }, [user_auth_context]);
};

export const useBypassLoginIfInDebugMode = (setEmail, setFirstName, setLastName) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get('debug');
    if (isDebugMode === 'true') {
      setEmail('matt.t.healy1994@gmail.com');
      setFirstName('Matt');
      setLastName('Healy');
    }
  }, []);
};

export const useFilterEvents = (
  find_event_selected_date,
  find_event_start_time,
  find_event_end_time,
  map_events_full_day,
  event_types_selected,
  setMapEventsFiltered,
  // logger
) => {
  useEffect(() => {
    const start_time_raw_string = `${find_event_selected_date}T${find_event_start_time}`;
    const end_time_raw_string = `${find_event_selected_date}T${find_event_end_time}`;
    // logger.info(`Datetime changed - startTime: ${start_time_raw_string} endTime: ${end_time_raw_string}`);

    const startTime = new Date(start_time_raw_string);
    const endTime = new Date(end_time_raw_string);

    const filteredEvents = map_events_full_day.filter((event) => {
      const eventTimestamp = new Date(event.StartTimestamp);
      return (
        eventTimestamp >= startTime &&
        eventTimestamp <= endTime &&
        event_types_selected.includes(event.EventTypeUUID)
      );
    });
    // logger.info('filteredEvents:', filteredEvents);
    setMapEventsFiltered(filteredEvents);
  }, [
    find_event_selected_date,
    find_event_start_time,
    find_event_end_time,
    map_events_full_day,
    event_types_selected,
    setMapEventsFiltered,
    // logger
  ]);
};

export const useSetUserLocation = (setMapCenter) => {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({
          lat: latitude,
          lng: longitude
        });
      },
      (error) => {
        console.error("Error getting user's location:", error);
        toast.error("Error fetching your location. Defaulting to Philadelphia.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);
};
