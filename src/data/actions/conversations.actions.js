import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import Messages from '../../services/models/messages.model';
import { userSelector } from '../selectors/user.selector'
import P2P from '../../services/p2p'

function storeConversations(data) {
  return {
    type: types.SET_CONVERSATIONS,
    data
  };
}

export function listenForConversations() {
  const conversationID = 'mTpoKpbbbS4fXuUep3yp'

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

    Messages.listenForP2PInit(conversationID)
      .listen((messages) => {
        console.log('p2pInitMessage', messages)
        if(messages[0] && messages[0].senderID !== user.uid){
          P2P.setOnSignal(signal => {
            Conversations.sendMessageToConversation(conversationID, {
              senderID: user.uid,
              content: JSON.stringify(signal),
              type: Messages.TYPES.P2P_CONNECT,
              sentDate: new Date()
            });
          })
          P2P.connectToFriend(false, messages[0].content)
        }
      })
      .catch((error) => {
        console.warn('listenForP2PInit error', error);
      });

    Messages.listenForP2PConnect(conversationID)
      .listen((messages) => {
        console.log('p2pConnectMessage', messages)
        if(messages[0] && messages[0].senderID !== user.uid){
          P2P.setOnSignal(null)
          P2P.connectToFriend(false, messages[0].content)
        }
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
