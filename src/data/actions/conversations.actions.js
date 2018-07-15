import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import Messages from '../../services/models/messages.model';
import { conversationsSelector } from '../selectors/conversations.selector';
import { userSelector } from '../selectors/user.selector';
import { handleP2PConnectMessage, handleP2PInitMessage } from './p2p.actions';

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

        // TODO: Remove this eventually
        dispatch(selectConversation('mTpoKpbbbS4fXuUep3yp'));
      })
      .catch((error) => {
        console.warn('listenForConversations error', error);
        dispatch({ type: types.LOADING_CONVERSATIONS, data: false });
      });
  };
}


function getOtherMember(members, myID) {
  return Object.keys(members).find(id => id !== myID);
}

export function selectConversation(conversationID) {
  return (dispatch, getState) => {
    const conversations = conversationsSelector(getState());
    const currentConvo = conversations.find(c => c.id === conversationID);
    dispatch({ type: types.SET_CURRENT_CONVERSATION, data: currentConvo });

    const user = userSelector(getState());
    const otherMemberID = getOtherMember(currentConvo.members, user.uid);

    Messages.listenForP2PInit(conversationID, otherMemberID)
      .listen((message) => {
        dispatch(handleP2PInitMessage(conversationID, message));
      })
      .catch((error) => {
        console.warn('listenForP2PInit error', error);
      });

    Messages.listenForP2PConnect(conversationID, otherMemberID)
      .listen((message) => {
        dispatch(handleP2PConnectMessage(conversationID, message));
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
