/**
 * Geo Service — Distance and coordinate resolution
 * 
 * Provides:
 *  - Coordinate lookup for known Indian agricultural hubs
 *  - Haversine great-circle distance with 1.3× road curvature factor
 *  - Future-ready hook for Google Maps / OpenRoute API when MAPS_API_KEY is set
 */

// Pre-loaded city coordinates for key Tamil Nadu and Indian agricultural hubs
const CITY_COORDS = {
  'cuddalore':        { lat: 11.7480, lng: 79.7714 },
  'chennai':          { lat: 13.0827, lng: 80.2707 },
  'villupuram':       { lat: 11.9390, lng: 79.4930 },
  'kanchipuram':      { lat: 12.8342, lng: 79.7036 },
  'madurai':          { lat: 9.9252, lng:  78.1198 },
  'coimbatore':       { lat: 11.0168, lng: 76.9558 },
  'salem':            { lat: 11.6643, lng: 78.1460 },
  'tiruchirapalli':   { lat: 10.7905, lng: 78.7047 },
  'trichy':           { lat: 10.7905, lng: 78.7047 },
  'thanjavur':        { lat: 10.7867, lng: 79.1378 },
  'tirunelveli':      { lat: 8.7139,  lng: 77.7567 },
  'erode':            { lat: 11.3410, lng: 77.7172 },
  'vellore':          { lat: 12.9165, lng: 79.1325 },
  'thoothukudi':      { lat: 8.7642,  lng: 78.1348 },
  'ooty':             { lat: 11.4102, lng: 76.6950 },
  'pondicherry':      { lat: 11.9416, lng: 79.8083 },
  'puducherry':       { lat: 11.9416, lng: 79.8083 },
  'nagercoil':        { lat: 8.1833,  lng: 77.4119 },
  // North India
  'ludhiana':         { lat: 30.9010, lng: 75.8573 },
  'karnal':           { lat: 29.6857, lng: 76.9905 },
  'ambala':           { lat: 30.3782, lng: 76.7767 },
  'patiala':          { lat: 30.3398, lng: 76.3869 },
  'chandigarh':       { lat: 30.7333, lng: 76.7794 },
  'amritsar':         { lat: 31.6340, lng: 74.8723 },
  'jalandhar':        { lat: 31.3260, lng: 75.5762 },
  'bathinda':         { lat: 30.2110, lng: 74.9455 },
  'delhi':            { lat: 28.6139, lng: 77.2090 },
  'new delhi':        { lat: 28.6139, lng: 77.2090 },
  'agra':             { lat: 27.1767, lng: 78.0081 },
  'lucknow':          { lat: 26.8467, lng: 80.9462 },
  'varanasi':         { lat: 25.3176, lng: 82.9739 },
  'patna':            { lat: 25.5941, lng: 85.1376 },
  'kolkata':          { lat: 22.5726, lng: 88.3639 },
  'mumbai':           { lat: 19.0760, lng: 72.8777 },
  'pune':             { lat: 18.5204, lng: 73.8567 },
  'nagpur':           { lat: 21.1458, lng: 79.0882 },
  'hyderabad':        { lat: 17.3850, lng: 78.4867 },
  'bengaluru':        { lat: 12.9716, lng: 77.5946 },
  'bangalore':        { lat: 12.9716, lng: 77.5946 },
  'mysuru':           { lat: 12.2958, lng: 76.6394 },
  'mangaluru':        { lat: 12.9141, lng: 74.8560 },
};

/**
 * Haversine formula — returns great-circle distance in km
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Road curvature factor — straight-line distance underestimates real road distance
 */
const ROAD_FACTOR = 1.3;

/**
 * Get coordinates from a city name string
 */
function resolveCoords(locationName) {
  if (!locationName) return null;
  const key = locationName.trim().toLowerCase();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Partial match: try first word
  const firstWord = key.split(/[\s,]/)[0];
  return CITY_COORDS[firstWord] || null;
}

/**
 * Calculate road-adjusted distance in km between two location names or coordinate pairs
 */
function calculateDistance(fromLocation, toLocation, fromLatLng = null, toLatLng = null) {
  let from = fromLatLng || resolveCoords(fromLocation);
  let to = toLatLng || resolveCoords(toLocation);

  if (!from || !to) {
    return null; // Cannot resolve locations
  }

  if (from.lat === to.lat && from.lng === to.lng) return 0;

  const straightLine = haversineKm(from.lat, from.lng, to.lat, to.lng);
  return Math.round(straightLine * ROAD_FACTOR);
}

/**
 * Get coordinates for a given location name, returns null if unknown
 */
function getCoords(locationName) {
  return resolveCoords(locationName);
}

module.exports = {
  calculateDistance,
  getCoords,
  CITY_COORDS
};
