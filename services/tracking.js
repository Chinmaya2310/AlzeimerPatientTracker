// Tracks a walk inside an Android foreground service, so GPS keeps running with the
// screen off or the app in the background. Each point goes to the backend, which
// decides whether the patient has left the safe zone and alerts the caregiver.
import BackgroundService from 'react-native-background-actions';
import Geolocation from '@react-native-community/geolocation';
import trackerApi from '../apis/tracker';

let listener = null;
// The UI subscribes to {type: 'location' | 'status' | 'error', ...} events
export const setTrackingListener = fn => {
  listener = fn;
};
const emit = event => listener && listener(event);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const onPosition = async location => {
  emit({type: 'location', location});
  try {
    const res = await trackerApi.post('/locations', {
      coords: location.coords,
      timestamp: location.timestamp,
    });
    emit({type: 'status', status: res.data});
  } catch (err) {
    emit({type: 'error', error: `Connection problem: ${err.message}`});
  }
};

const task = async () => {
  const watchId = Geolocation.watchPosition(onPosition, err => emit({type: 'error', error: err.message}), {
    enableHighAccuracy: true,
    distanceFilter: 10, // metres
    interval: 5000,
    fastestInterval: 2000,
  });
  // the service stays alive as long as this function hasn't returned
  while (BackgroundService.isRunning()) {
    await sleep(1000);
  }
  Geolocation.clearWatch(watchId);
};

const options = {
  taskName: 'SafeWalkTracking',
  taskTitle: 'SafeWalk is tracking a walk',
  taskDesc: 'The caregiver is alerted if the patient leaves the safe zone.',
  taskIcon: {name: 'ic_launcher', type: 'mipmap'},
  color: '#2F6FED',
};

export const startTracking = async () => {
  await trackerApi.post('/tracking/start'); // reset the server's alert state for this walk
  if (!BackgroundService.isRunning()) {
    await BackgroundService.start(task, options);
  }
};

export const stopTracking = async () => {
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};
