import * as types from '../action-types';
import ChatMessages from '../../services/models/chatMessages.model';

function storeChatMessages(data) {
  return {
    type: types.SET_CHAT_MESSAGES,
    data,
  };
}

export function listenForChatMessages() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_CHAT_MESSAGES, data: true });
    ChatMessages.listenForChatMessages()
      .listen((chatMessages) => {
        dispatch(storeChatMessages(chatMessages));
        dispatch({ type: types.LOADING_CHAT_MESSAGES, data: false });
      })
      .catch((error) => {
        console.warn('listenForChatMessages error', error);
        dispatch({ type: types.LOADING_CHAT_MESSAGES, data: false });
      });
  };
}

export function sendChatMessage(message) {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_CHAT_MESSAGES, data: true });
    ChatMessages.sendChatMessage(message)
      .catch((error) => {
        console.warn('sendChatMessage error', error);
        dispatch({ type: types.LOADING_CHAT_MESSAGES, data: false });
      });
  };
}
