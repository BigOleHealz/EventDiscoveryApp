

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
      return null;
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return null;
  }
};

export function neo4jFormatString(template, ...args) {
  return template.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  })
};
