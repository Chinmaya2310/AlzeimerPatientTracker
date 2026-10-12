import createDataContext from './createDataContext';
import trackerApi from '../apis/tracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {navigate} from '../navigation/navigationRef';
const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return {...state, errMessage: action.payload};
    case 'signin':
      return {errMessage: '', token: action.payload};
    case 'clear_error':
      return {...state, errMessage: ''};
    case 'signout':
      return {token: null, errorMessage: ''};
    default:
      return state;
  }
};
const signup = dispatch => async ({email, password, phone}) => {
  // console.log(phone);
  try {
    const response = await trackerApi.post('/signup', {email, password, phone});
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({type: 'signin', payload: response.data.token});
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Could not create the account. This email may already be registered.',
    });
  }
};

const signin = dispatch => async ({email, password}) => {
  try {
    const response = await trackerApi.post('/signin', {email, password});
    console.log('Hii this is ', response.data);
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({type: 'signin', payload: response.data.token});
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Wrong email or password.',
    });
  }
};

const tryLocalSignin = dispatch => async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    dispatch({type: 'signin', payload: token});
  }
};

const clearError = dispatch => () => dispatch({type: 'clear_error'});

const signout = dispatch => async () => {
  await AsyncStorage.removeItem('token');
  dispatch({type: 'signout'});
  // navigate('Login');
};

export const {Provider, Context} = createDataContext(
  authReducer,
  {signin, signout, signup, tryLocalSignin, clearError},
  {token: '', errMessage: ''},
);
