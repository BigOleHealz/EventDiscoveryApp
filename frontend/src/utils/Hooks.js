import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import { storeUserSession } from './SessionManager';

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
