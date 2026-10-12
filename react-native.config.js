// These location libraries are installed but never imported; the app uses
// @react-native-community/geolocation. react-native-location no longer compiles.
module.exports = {
  dependencies: {
    'react-native-location': {platforms: {android: null, ios: null}},
    'expo-location': {platforms: {android: null, ios: null}},
  },
};
