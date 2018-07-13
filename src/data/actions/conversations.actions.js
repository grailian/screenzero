import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import { userSelector } from '../selectors/user.selector'

function storeConversations(data) {
  return {
    type: types.SET_CONVERSATIONS,
    data,
  };
}

export function listenForConversations() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_CONVERSATIONS, data: true });
    const user = userSelector(getState())
    Conversations.listenForConversations(user.uid)
      .listen((conversations) => {
      console.log('convo actions', conversations)
        dispatch(storeConversations(conversations));
        dispatch({ type: types.LOADING_CONVERSATIONS, data: false });
      })
      .catch((error) => {
        console.warn('listenForConversations error', error);
        dispatch({ type: types.LOADING_CONVERSATIONS, data: false });
      });
  };
}

export function sendChatMessage(conversationID, data) {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_CHAT_MESSAGES, data: true });
    Conversations.sendMessageToConversation(conversationID, data)
      .catch((error) => {
        console.warn('sendChatMessage error', error);
        dispatch({ type: types.LOADING_CHAT_MESSAGES, data: false });
      });
  };
}
