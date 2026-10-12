import Geolocation from '@react-native-community/geolocation';

// On Android this library uses GPS only when enableHighAccuracy is true, and a GPS fix can
// take minutes (or never come) indoors. The network/last-known position arrives in seconds.
export const quickPosition = (onPosition, onError) =>
  Geolocation.getCurrentPosition(onPosition, onError || (() => {}), {
    enableHighAccuracy: false,
    maximumAge: 5 * 60 * 1000, // a fix from the last 5 minutes is fine to start with
    timeout: 10000,
  });

// Best available position: try GPS briefly, fall back to the network position
export const bestPosition = (onPosition, onError) =>
  Geolocation.getCurrentPosition(
    onPosition,
    () => quickPosition(onPosition, onError),
    {enableHighAccuracy: true, maximumAge: 60 * 1000, timeout: 8000},
  );
