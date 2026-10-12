import trackerApi from '../apis/tracker';
import createDataContext from './createDataContext';
const userReducer = (state, action) => {
  switch (action.type) {
    case 'get_user':
      return {...state, user: action.payload};
    case 'update':
      return {...state, user: action.payload};
    case 'clear':
      return {...state, user: {}};
    default:
      return state;
  }
};

const getInfoUser = dispatch => async () => {
  try {
    const response = await trackerApi.get('/operationUser');
    dispatch({type: 'get_user', payload: response.data});
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with signup',
    });
  }
};

const updateUser = dispatch => async ({userData}) => {
  try {
    const response = await trackerApi.put('/operationUser', {
      userData,
    });
    dispatch({type: 'update', payload: response.data});
    return true;
  } catch (err) {
    console.log('updateUser failed', err.message);
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong while changing',
    });
  }
  return false;
};

export const {Context, Provider} = createDataContext(
  userReducer,
  {getInfoUser, updateUser, clearUser: dispatch => () => dispatch({type: 'clear'})},
  {user: {}},
);
