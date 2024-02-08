import React from 'react';


const useFetchGoogleMapsApiKey = (
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

export const Deploy = ({prop}) => {

  const [fetching_google_maps_api_key, setFetchingGoogleMapsApiKey] = useState(true);
  const [google_maps_api_key, setGoogleMapsApiKey] = useState(null);
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

  return (
    <div>
      <h1>{prop.tutorial}</h1>
    </div>
  );
}