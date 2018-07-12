import * as types from '../action-types';
import User from '../../services/models/user.model';
import { listenForChatMessages } from './chatMessages.actions';
import { listenForFriends } from './friends.actions';

function storeUser(data) {
  return {
    type: types.SET_USER,
    data,
  };
}

export function initialize() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_USER, data: true });
    User.onAuthStateChanged()
      .listen((user) => {
        dispatch(storeUser(user));
        dispatch({ type: types.LOADING_USER, data: false });

        if (user) {
          dispatch(listenForFriends());
          dispatch(listenForChatMessages());
        }
      });
  };
}

export function login(email, password) {
  return async (dispatch, getState) => {
    try {
      console.log('email, password', email, password);
      dispatch({ type: types.LOADING_USER, data: true });
      const user = await User.login(email, password);
      console.log('user', user);
      dispatch({ type: types.LOADING_USER, data: false });
    } catch (error) {
      console.log('error', error);
      dispatch({ type: types.LOADING_USER, data: false });
    }
  };
}
