import { combineReducers } from 'redux';
import * as types from '../action-types';

const initialStateLoading = false;

function loading(state = initialStateLoading, action) {
  switch (action.type) {
    case types.LOADING_REMOTE_STREAM:
      return action.data;
    default:
      return state;
  }
}

const initialStateData = null;

function data(state = initialStateData, action) {
  switch (action.type) {
    case types.SET_REMOTE_STREAM:
      return action.data;
    default:
      return state;
  }
}

export default combineReducers({
  loading,
  data,
});
