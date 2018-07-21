import * as types from '../action-types';
import Friends from '../../services/models/friends.model';
import Profiles from '../../services/models/profiles.model';
import { userSelector } from '../selectors/user.selector';

function storeFriends(data) {
  return {
    type: types.SET_FRIENDS,
    data,
  };
}

function storeFriendConnections(data) {
  return {
    type: types.SET_FRIEND_CONNECTIONS,
    data,
  };
}

function getOtherMember(members, myID) {
  return Object.keys(members).find(id => id !== myID);
}

function fetchFriendProfiles(friendConnections) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.LOADING_FRIENDS, data: true });

      const user = userSelector(getState());
      const friends = await Promise.all(friendConnections.map((friend) => {
        const friendID = getOtherMember(friend.members, user.uid);
        return Profiles.getByID(friendID);
      }));

      dispatch(storeFriends(friends));
      dispatch({ type: types.LOADING_FRIENDS, data: false });
    } catch (error) {
      console.warn('fetchFriendProfiles error', error);
      dispatch({ type: types.LOADING_FRIENDS, data: false });
    }
  };
}

export function listenForFriends() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_FRIEND_CONNECTIONS, data: true });
    const user = userSelector(getState());
    Friends.listenForFriends(user.uid)
      .listen((friendConnections) => {
        dispatch(storeFriendConnections(friendConnections));
        dispatch(fetchFriendProfiles(friendConnections));
        dispatch({ type: types.LOADING_FRIEND_CONNECTIONS, data: false });
      })
      .catch((error) => {
        console.warn('listenForFriends error', error);
        dispatch({ type: types.LOADING_FRIEND_CONNECTIONS, data: false });
      });
  };
}

export function sendFriendRequest(email) {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.LOADING_FRIENDS, data: true });
      const user = userSelector(getState());
      const profile = await Profiles.getByEmail(email);
      if (profile) {
        await Friends.sendRequest(user.uid, profile.id);
      }
      dispatch({ type: types.LOADING_FRIENDS, data: false });
    } catch (error) {
      console.warn('sendFriendRequest error', error);
      dispatch({ type: types.LOADING_FRIENDS, data: false });
    }
  };
}
