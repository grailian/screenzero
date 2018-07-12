import { combineReducers } from 'redux';
import * as types from '../action-types';

const initialStateLoading = false;

function loading(state = initialStateLoading, action) {
  switch (action.type) {
    case types.LOADING_CHAT_MESSAGES:
      return action.data;
    default:
      return state;
  }
}

const initialStateData = [];

function data(state = initialStateData, action) {
  switch (action.type) {
    case types.SET_CHAT_MESSAGES:
      return action.data;
    default:
      return state;
  }
}

export default combineReducers({
  loading,
  data,
});
