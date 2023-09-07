import CryptoJS from 'crypto-js';
import moment from 'moment-timezone';



export async function getAddressFromCoordinates(latitude, longitude, apiKey) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK') {
      const address = data.results[0].formatted_address;
      console.log('Address:', address);
      return address;
    } else {
      console.error('Geocoding API error:', data.error_message);
      return '';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return '';
  }
};

export const convertUTCDateToLocalDate = (date) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return moment.utc(date).tz(userTimezone).format();
}

export function formatLogStreamNameDate() {
  const d = new Date();
  let formattedDate = d.toISOString();
  formattedDate = formattedDate.replace(/:/g, '_').replace(/-/g, '_').replace('.', '_').replace('Z', '');
  return formattedDate;
};

export const getUserLocation = () => {
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
};