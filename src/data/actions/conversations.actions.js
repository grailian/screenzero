import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import { userSelector } from '../selectors/user.selector';
import { listenForP2POffers, listenForP2PAnswers } from './p2p.actions';

function storeConversations(data) {
  return {
    type: types.SET_CONVERSATIONS,
    data,
  };
}

export function listenForConversations() {
  return (dispatch, getState) => {
    dispatch({ type: types.LOADING_CONVERSATIONS, data: true });

    const user = userSelector(getState());

    Conversations.listenForConversations(user.uid)
      .listen((conversations) => {
        dispatch(storeConversations(conversations));
        dispatch(listenForP2POffers(conversations));
        dispatch(listenForP2PAnswers(conversations));
        dispatch({ type: types.LOADING_CONVERSATIONS, data: false });
      })
      .catch((error) => {
        console.warn('listenForConversations error', error);
        dispatch({ type: types.LOADING_CONVERSATIONS, data: false });
      });
  };
}

export function selectConversation(conversationID) {
  return (dispatch, getState) => {
    dispatch({ type: types.SET_CURRENT_CONVERSATION, data: conversationID });
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

export function createConversation(userID, friendID) {
  return (dispatch, getState) => {
    const members = {
      [userID]: true,
      [friendID]: true,
    };
    return Conversations.createConversation(members)
      .catch((error) => {
        console.warn('createConversation error', error);
      });
  };
}
