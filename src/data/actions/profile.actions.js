import * as types from '../action-types';
import Profile from '../../services/models/profiles.model';
import { userSelector } from '../selectors/user.selector';

export function storeProfile(data) {
  return {
    type: types.SET_PROFILE,
    data,
  };
}

export function fetchProfile() {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: types.LOADING_PROFILE, data: true });
      const user = userSelector(getState());
      const profile = await Profile.getByID(user.uid);
      dispatch(storeProfile(profile));
      dispatch({ type: types.LOADING_PROFILE, data: false });
      return profile;
    } catch (error) {
      console.warn('fetchProfile error', error);
      dispatch({ type: types.LOADING_PROFILE, data: false });
    }
  };
}
