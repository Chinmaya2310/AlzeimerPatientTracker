// Great-circle distance in km between two {latitude, longitude} points
export const distanceKm = (a, b) => {
  const rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};

// Total length of a recorded walk in km
export const pathLengthKm = locations =>
  locations.reduce(
    (sum, loc, i) => (i === 0 ? 0 : sum + distanceKm(locations[i - 1].coords, loc.coords)),
    0,
  );

export const formatKm = km => (km < 1 ? `${Math.round(km * 1000)} m` : `${parseFloat(km.toFixed(2))} km`);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// e.g. "12 Oct, 2:56 PM" (formatted by hand: Android's JS engine has no Intl date support)
export const formatDateTime = value => {
  const d = new Date(value);
  const h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
};
