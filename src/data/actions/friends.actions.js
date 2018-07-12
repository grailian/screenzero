import * as types from '../action-types';
import Friends from '../../services/models/friends.model';

function storeFriends(data) {
  return {
    type: types.SET_FRIENDS,
    data,
  };
}

export function listenForFriends() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_FRIENDS, data: true });
    Friends.listenForFriends()
      .listen((friends) => {
        dispatch(storeFriends(friends));
        dispatch({ type: types.LOADING_FRIENDS, data: false });
      })
      .catch((error) => {
        console.warn('listenForFriends error', error);
        dispatch({ type: types.LOADING_FRIENDS, data: false });
      });
  };
}
