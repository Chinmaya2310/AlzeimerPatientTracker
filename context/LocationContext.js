/* eslint-disable prettier/prettier */
import trackerApi from '../apis/tracker';
import {startTracking, stopTracking} from '../services/tracking';

import createDataContext from './createDataContext';
const locationReducer = (state, action) => {
  switch (action.type) {
    case 'add_current_location':
      return {...state, currentLocation: action.payload};
    case 'start_recording':
      return {...state, recording: true, lastAlert: null, zoneStatus: null, trackingError: null};
    case 'zone_status':
      return {...state, zoneStatus: action.payload, trackingError: null};
    case 'tracking_error':
      return {...state, trackingError: action.payload};
    case 'stop_recording':
      return {...state, recording: false};
    case 'add_location':
      return {...state, locations: [...state.locations, action.payload]};
    case 'change_name':
      return {...state, name: action.payload};
    case 'get_user':
      return {...state, user: action.payload};
    case 'reset':
      return {...state, name: '', locations: []};
    case 'clear':
      return {...state, name: '', locations: [], recording: false, lastAlert: null, zoneStatus: null};
    case 'alert_sent':
      return {...state, lastAlert: action.payload};
    default:
      return state;
  }
};

const changeName = dispatch => name => {
  dispatch({type: 'change_name', payload: name});
};

// Recording runs in a background service (services/tracking.js); see TrackingBridge
const startRecording = dispatch => async () => {
  dispatch({type: 'start_recording'});
  try {
    await startTracking();
  } catch (err) {
    dispatch({type: 'stop_recording'});
    dispatch({type: 'tracking_error', payload: 'Could not start tracking. Is the backend running?'});
  }
};
const stopRecording = dispatch => async () => {
  dispatch({type: 'stop_recording'});
  await stopTracking();
};
// Server verdict for each point: {distanceKm, outside, alert}
const setZoneStatus = dispatch => status => {
  dispatch({type: 'zone_status', payload: status});
  if (status.alert) {
    dispatch({type: 'alert_sent', payload: status.alert});
  }
};
const setTrackingError = dispatch => message => dispatch({type: 'tracking_error', payload: message});
const addLocation = dispatch => (location, recording) => {
  dispatch({type: 'add_current_location', payload: location});
  if (recording) {
    dispatch({type: 'add_location', payload: location});
  }
};
const clear = dispatch => () => {
  stopTracking();
  dispatch({type: 'clear'});
};

const reset = dispatch => () => {
  dispatch({type: 'reset'});
};
const getUser = dispatch => async () => {
  try {
    const response = await trackerApi.get('/getdetails');
    dispatch({type: 'get_user', payload: response.data});
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with signup',
    });
  }
};

const sendLocation = dispatch => async ({currentLocation, dist}) => {
  try {
    const response = await trackerApi.post('/sendMessage', {
      currentLocation,
      dist,
    });
    dispatch({type: 'alert_sent', payload: {...response.data.alert, sent: true}});
  } catch (err) {
    const alert = err.response && err.response.data && err.response.data.alert;
    dispatch({
      type: 'alert_sent',
      payload: {...(alert || {createdAt: new Date().toISOString(), distanceKm: dist}), sent: false},
    });
  }
};

export const {Context, Provider} = createDataContext(
  locationReducer,
  {
    startRecording,
    stopRecording,
    addLocation,
    changeName,
    reset,
    clear,
    setZoneStatus,
    setTrackingError,
    getUser,
    sendLocation,
  },
  {name: '', recording: false, locations: [], currentLocation: null, user: {}, lastAlert: null, zoneStatus: null, trackingError: null},
);
