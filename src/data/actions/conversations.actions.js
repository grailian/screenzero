import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import Offers from '../../services/models/offers.model';
import Answers from '../../services/models/answers.model';
import { userSelector } from '../selectors/user.selector';
import { handleP2POfferMessage, handleP2PAnswerMessage } from './p2p.actions';

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

    const user = userSelector(getState());

    Offers.listenForP2POffers(conversationID, user.uid)
      .listen((message) => {
        dispatch(handleP2POfferMessage(conversationID, message));
      })
      .catch((error) => {
        console.warn('listenForP2POffers error', error);
      });

    Answers.listenForP2PAnswers(conversationID, user.uid)
      .listen((message) => {
        dispatch(handleP2PAnswerMessage(conversationID, message));
      })
      .catch((error) => {
        console.warn('listenForP2PInit error', error);
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

export function createConversation(userID, friendID) {
  return (dispatch, getState) => {
    const members = {
      [userID]: true,
      [friendID]: true,
    };
    Conversations.createConversation(members)
      .then()
      .catch((error) => {
        console.warn('createConversation error', error);
        dispatch({ type: types.LOADING_CHAT_MESSAGES, data: false });
      });
  };
}
