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

export function neo4jFormatString(template, ...args) {
  return template.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  })
};

export function hashPassword(inputString) {
  const hashed = CryptoJS.SHA256(inputString);
  return hashed.toString(CryptoJS.enc.Hex);
}

export const convertUTCDateToLocalDate = (date) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return moment.utc(date).tz(userTimezone).format();
}