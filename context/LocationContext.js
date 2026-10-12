/* eslint-disable prettier/prettier */
import trackerApi from '../apis/tracker';

import createDataContext from './createDataContext';
const locationReducer = (state, action) => {
  switch (action.type) {
    case 'add_current_location':
      return {...state, currentLocation: action.payload};
    case 'start_recording':
      return {...state, recording: true, lastAlert: null};
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
    case 'alert_sent':
      return {...state, lastAlert: action.payload};
    default:
      return state;
  }
};

const changeName = dispatch => name => {
  dispatch({type: 'change_name', payload: name});
};

const startRecording = dispatch => () => {
  dispatch({type: 'start_recording'});
};
const stopRecording = dispatch => () => {
  dispatch({type: 'stop_recording'});
};
const addLocation = dispatch => (location, recording) => {
  dispatch({type: 'add_current_location', payload: location});
  if (recording) {
    dispatch({type: 'add_location', payload: location});
  }
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
    dispatch({type: 'alert_sent', payload: {...response.data.alert, smsSent: true}});
  } catch (err) {
    const alert = err.response && err.response.data && err.response.data.alert;
    dispatch({
      type: 'alert_sent',
      payload: {...(alert || {createdAt: new Date().toISOString(), distanceKm: dist}), smsSent: false},
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
    getUser,
    sendLocation,
  },
  {name: '', recording: false, locations: [], currentLocation: null, user: {}, lastAlert: null},
);
