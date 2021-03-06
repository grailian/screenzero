import * as types from '../action-types';
import Offers from '../../services/models/offers.model';
import Answers from '../../services/models/answers.model';
import { userSelector } from '../selectors/user.selector';
import P2P from '../../services/p2p';

function storeRemoteStream(data) {
  return {
    type: types.SET_REMOTE_STREAM,
    data,
  };
}

function getOtherMember(members, myID) {
  return Object.keys(members).find(id => id !== myID);
}

/**
 * Creates a new peer connection with initiator=true
 * Will send a P2P_OFFER signal message
 *
 * @param conversation
 * @param useVideo
 * @returns {Function}
 */
export function connectToFriend(conversation, useVideo) {
  return async (dispatch, getState) => {
    try {
      console.log('------------connectToFriend------------');

      const user = userSelector(getState());
      const otherMemberID = getOtherMember(conversation.members, user.uid);

      await Offers.deleteAllOffers(conversation.id);
      await Answers.deleteAllAnswers(conversation.id);

      if (P2P.myStream && P2P.localPeer) {
        console.log('ADDING TRACK');
        await P2P.addTrack(useVideo);
      } else {
        console.log('🌴🌮🌴🌮🌴🌮🌴CONNECTING FRESH🌴🌮🌴🌮🌴🌮🌴');

        // Register signal callback
        P2P.setOnSignal(async (outgoingSignal) => {
          if (outgoingSignal.type === 'offer') {
            console.log('sending P2P_OFFER Message', outgoingSignal.type);
            const offer = {
              fromID: user.uid,
              toID: otherMemberID,
              signal: JSON.stringify(outgoingSignal),
            };
            await Offers.sendOffer(conversation.id, offer);
          } else {
            console.log('NOT sending P2P_OFFER Message', outgoingSignal);
          }
        });

        await P2P.connectToFriend(useVideo);
      }
    } catch (error) {
      console.warn('connectToFriend error', error);
    }
  };
}

export function listenForP2POffers(conversations) {
  return (dispatch, getState) => {
    const user = userSelector(getState());
    const conversationIDs = conversations.map(c => c.id);

    Offers.listenForP2POffers(conversationIDs, user.uid)
      .listen((offersByConvoID) => {
        Object.keys(offersByConvoID).forEach((convoID) => {
          dispatch(handleP2POfferMessage(convoID, offersByConvoID[convoID]));
        });
      })
      .catch((error) => {
        console.warn('listenForP2POffers error', error);
      });
  };
}

export function listenForP2PAnswers(conversations) {
  return (dispatch, getState) => {
    const user = userSelector(getState());
    const conversationIDs = conversations.map(c => c.id);

    Answers.listenForP2PAnswers(conversationIDs, user.uid)
      .listen((offersByConvoID) => {
        Object.keys(offersByConvoID).forEach((convoID) => {
          dispatch(handleP2PAnswerMessage(convoID, offersByConvoID[convoID]));
        });
      })
      .catch((error) => {
        console.warn('listenForP2PInit error', error);
      });
  };
}

let sentAnswer = false;

/**
 * Handles a P2P OFFER signal message
 * Will send a P2P ANSWER signal message
 *
 * @param conversationID
 * @param message
 * @returns {Function}
 */
export function handleP2POfferMessage(conversationID, message) {
  return async (dispatch, getState) => {
    try {

      console.log('received P2P_OFFER message.id', message.id);
      console.log('received P2P_OFFER message.fromID', message.fromID);
      console.log('received P2P_OFFER message.toID', message.toID);

      const incomingSignal = JSON.parse(message.signal);
      console.log('received P2P_OFFER Message', incomingSignal.type);
      const user = userSelector(getState());

      // Register signal callback
      P2P.setOnSignal(async (outgoingSignal) => {
        if (outgoingSignal.type === 'answer') {
          if (!sentAnswer) {
            sentAnswer = true;
            console.log('sending P2P_ANSWER Message', outgoingSignal.type);
            const answer = {
              fromID: user.uid,
              toID: message.fromID,
              signal: JSON.stringify(outgoingSignal),
            };
            await Answers.sendAnswer(conversationID, answer);
            await Offers.deleteAllOffers(conversationID);
          }
        } else {
          console.log('NOT sending P2P_ANSWER Message', outgoingSignal);
        }
      });

      P2P.setOnStream((stream) => {
        dispatch(storeRemoteStream(stream));
      });

      P2P.setOnTrack((track, stream) => {
        dispatch(storeRemoteStream(stream));
      });

      await P2P.acceptOffer(incomingSignal);
    } catch (error) {
      console.warn('handleP2POfferMessage error', error);
    }
  };
}

/**
 * Handles a P2P ANSWER signal message
 * Finalizes a peer connection
 *
 * @param conversationID
 * @param message
 * @returns {Function}
 */
export function handleP2PAnswerMessage(conversationID, message) {
  return async (dispatch, getState) => {
    try {
      const incomingSignal = JSON.parse(message.signal);
      if (incomingSignal.type === 'answer') {
        console.log('received P2P_ANSWER Message', incomingSignal.type);
        console.log('content.type', incomingSignal.type);
        console.log('content', incomingSignal);

        P2P.setOnStream((stream) => {
          dispatch(storeRemoteStream(stream));
        });

        P2P.setOnTrack((track, stream) => {
          dispatch(storeRemoteStream(stream));
        });

        // De-Register signal callback
        P2P.setOnSignal(null);
        await P2P.acceptAnswer(incomingSignal);
        await Answers.deleteAllAnswers(conversationID);
      } else {
        console.log('received P2P_ANSWER Message', incomingSignal);
      }
    } catch (error) {
      console.warn('handleP2PAnswerMessage error', error);
    }
  };
}

