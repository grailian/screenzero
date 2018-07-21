import * as types from '../action-types';
import User from '../../services/models/user.model';
import Profile from '../../services/models/profiles.model';
import { listenForChatMessages } from './chatMessages.actions';
import { listenForFriends } from './friends.actions';
import { listenForConversations } from './conversations.actions';
import { fetchProfile, storeProfile } from './profile.actions';

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
          dispatch(fetchProfile());
          dispatch(listenForFriends());
          dispatch(listenForChatMessages());
          dispatch(listenForConversations());
        } else {
          dispatch(storeProfile(null));
        }
      });
  };
}

export function login(email, password) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.LOADING_USER, data: true });
      const user = await User.login(email, password);
      dispatch({ type: types.LOADING_USER, data: false });
      return user;
    } catch (error) {
      console.warn('login error', error);
      dispatch({ type: types.LOADING_USER, data: false });
    }
  };
}

export function register(email, password) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.LOADING_USER, data: true });
      const user = await User.createNewUser(email, password);
      await Profile.create(user.uid, {
        email: user.email,
      });
      dispatch(fetchProfile());
      dispatch({ type: types.LOADING_USER, data: false });
      return user;
    } catch (error) {
      console.warn('login error', error);
      dispatch({ type: types.LOADING_USER, data: false });
    }
  };
}
