import { useEffect } from 'react';

import { useNavigate } from 'react-router-native';
import { storeUserSession } from './SessionManager';
import { toast } from 'react-toastify';

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

export const useFetchGoogleMapsApiKey = (fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey, setFetchingEvents) => {
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
      setFetchingEvents(true);
    }
  }, [fetching_google_maps_api_key, setGoogleMapsApiKey, setFetchingGoogleMapsApiKey, setFetchingEvents]);
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

export const useSetUserProfile = (email, setCreateUserProfileContext, setUserSession, first_name, last_name, resetLoginInfo, logger) => {
  const navigate = useNavigate();

  useEffect(() => {
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
            setCreateUserProfileContext({
              FirstName: first_name,
              LastName: last_name,
              Email: email
            });
            navigate('/create-account');
            return;
          }
          const user = data;
          user.TimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          storeUserSession(user, setUserSession);
          toast.success('Login Successful!');
          logger.info(`Login Successful for email: ${email}`);
          resetLoginInfo();
        }).catch((error) => {
          console.error('Error:', error);
          toast.error('An error occurred while fetching user profile!');
        });
    }
  }, [email, setCreateUserProfileContext, setUserSession, first_name, last_name, logger, navigate]);
};

export const useFilterEvents = (findGameSelectedDate, findGameStartTime, findGameEndTime, map_events_full_day, eventTypesSelected, setMapEventsFiltered, logger) => {
  useEffect(() => {
    const start_time_raw_string = `${findGameSelectedDate}T${findGameStartTime}`;
    const end_time_raw_string = `${findGameSelectedDate}T${findGameEndTime}`;
    logger.info(`Datetime changed - startTime: ${start_time_raw_string} endTime: ${end_time_raw_string}`);
    
    const startTime = new Date(start_time_raw_string);
    const endTime = new Date(end_time_raw_string);

    const filteredEvents = map_events_full_day.filter((event) => {
      const eventTimestamp = new Date(event.StartTimestamp);
      return (
        eventTimestamp >= startTime &&
        eventTimestamp <= endTime &&
        eventTypesSelected.includes(event.EventTypeUUID)
      );
    });
    
    logger.info('filteredEvents:', filteredEvents);
    setMapEventsFiltered(filteredEvents);
  }, [findGameSelectedDate, findGameStartTime, findGameEndTime, map_events_full_day, eventTypesSelected, setMapEventsFiltered, logger]);
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
