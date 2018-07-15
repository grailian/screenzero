import * as types from '../action-types';
import Conversations from '../../services/models/conversations.model';
import Messages from '../../services/models/messages.model';
import { conversationsSelector, currentConversationSelector } from '../selectors/conversations.selector';
import { remoteStreamSelector } from '../selectors/p2p.selector';
import { userSelector } from '../selectors/user.selector';
import P2P from '../../services/p2p';
import { sendChatMessage } from './conversations.actions';
import debouce from 'lodash/debounce';

function storeRemoteStream(data) {
  return {
    type: types.SET_REMOTE_STREAM,
    data,
  };
}

/**
 * Creates a new peer connection with initiator=true
 * Will send a P2P_INIT signal message
 *
 * @param conversationID
 * @param useVideo
 * @returns {Function}
 */
export function connectToFriend(conversationID, useVideo) {
  return async (dispatch, getState) => {
    try {
      const remoteStream = remoteStreamSelector(getState());
      console.log('------------connectToFriend------------');

      if (P2P.myStream && P2P.localPeer) {
        console.log('ADDING TRACK');
        await P2P.addTrack(remoteStream);
      } else {
        console.log('🌴🌮🌴🌮🌴🌮🌴CONNECTING FRESH🌴🌮🌴🌮🌴🌮🌴');

        // Register signal callback
        P2P.setOnSignal((signal) => {
          if (signal.type) {
            console.log('send P2P_INIT Message', signal.type);
            const message = {
              senderID: userSelector(getState()).uid,
              content: JSON.stringify(signal),
              type: Messages.TYPES.P2P_INIT,
              sentDate: new Date(),
            };
            dispatch(sendChatMessage(conversationID, message));
          } else {
            console.log('send P2P_INIT Message', signal);
          }
        });

        await P2P.connectToFriend(useVideo);
      }
    } catch (error) {
      console.warn('connectToFriend error', error);
    }
  };
}

/**
 * Creates a new peer connection with initiator=false
 * Handles a P2P_INIT signal message
 * Will send a P2P_CONNECT signal message
 *
 * @param conversationID
 * @param message
 * @returns {Function}
 */
export function handleP2PInitMessage(conversationID, message) {
  return async (dispatch, getState) => {
    try {
      const content = JSON.parse(message.content);

      console.log('received P2P_INIT Message', content.type);

      const user = userSelector(getState());

      // Register signal callback
      P2P.setOnSignal((signal) => {
        if (signal.type) {
          console.log('sending P2P_CONNECT Message', signal.type);
          const message = {
            senderID: user.uid,
            content: JSON.stringify(signal),
            type: Messages.TYPES.P2P_CONNECT,
            sentDate: new Date(),
          };

          const send = debouce(() => {
            console.log('sending...');
            // dispatch(sendChatMessage(conversationID, message));
          }, 2000);
          send();
        } else {
          console.log('NOT sending P2P_CONNECT Message', signal);
        }
      });

      P2P.setOnStream((stream) => {
        dispatch(storeRemoteStream(stream));
      });

      P2P.setOnTrack((track, stream) => {
        dispatch(storeRemoteStream(stream));
      });

      await P2P.joinConnectionToFriend(content);
    } catch (error) {
      console.warn('handleP2PInitMessage error', error);
    }
  };
}

/**
 * Finalizes a peer connection
 * Handles a P2P_CONNECT signal message
 *
 * @param conversationID
 * @param message
 * @returns {Function}
 */
export function handleP2PConnectMessage(conversationID, message) {
  return async (dispatch, getState) => {
    try {
      const content = JSON.parse(message.content);
      if (content.type) {
        console.log('received P2P_CONNECT Message', content.type);

        // De-Register signal callback
        P2P.setOnSignal(null);
        await P2P.joinConnectionToFriend(content);
      } else {
        console.log('received P2P_CONNECT Message', content);
      }
    } catch (error) {
      console.warn('handleP2PConnectMessage error', error);
    }
  };
}

