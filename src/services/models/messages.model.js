import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class MessagesModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'messages';


  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'content',
    'type',
    'senderID',
    'sentDate',
  ];

  TYPES = {
    CHAT: 'CHAT',
    P2P_INIT: 'P2P_INIT',
    P2P_CONNECT: 'P2P_CONNECT',
  };

  subscriptions = {
    messages: () => null,
    p2pInit: () => null,
    p2pConnect: () => null,
  };

  /**
   * Subscribe to the user's list of chatMessages
   *
   * @returns {Listener}
   */
  listenForMessages(conversationRef) {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      this.subscriptions.messages();
      this.subscriptions.messages = conversationRef
        .collection(this.COLLECTION_NAME)
        .orderBy('sentDate', 'asc')
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
          onUpdate(messages);
        }, onError);
    });
  }

  /**
   * Subscribe to a partner's P2P init messages
   *
   * @param conversationID
   * @param userID
   * @returns {Listener}
   */
  listenForP2PInit(conversationID, userID) {
    return new Listener((onUpdate, onError) => {
      const conversationRef = firebase.firestore()
        .collection('conversations')
        .doc(conversationID);

      this.subscriptions.p2pInit();
      this.subscriptions.p2pInit = conversationRef
        .collection(this.COLLECTION_NAME)
        .where('senderID', '==', userID)
        .where('type', '==', this.TYPES.P2P_INIT)
        .orderBy('sentDate', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
          if (messages.length > 0) {
            onUpdate(messages[0]);
          }
        }, onError);
    });
  }

  /**
   * Subscribe to a partner's P2P connect messages
   *
   * @param conversationID
   * @param userID
   * @returns {Listener}
   */
  listenForP2PConnect(conversationID, userID) {
    return new Listener((onUpdate, onError) => {
      const conversationRef = firebase.firestore()
        .collection('conversations')
        .doc(conversationID);

      this.subscriptions.p2pConnect();
      this.subscriptions.p2pConnect = conversationRef
        .collection(this.COLLECTION_NAME)
        .where('senderID', '==', userID)
        .where('type', '==', this.TYPES.P2P_CONNECT)
        .orderBy('sentDate', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
          if (messages.length > 0) {
            onUpdate(messages[0]);
          }
        }, onError);
    });
  }

  /**
   * Send a chatMessage
   *
   * @returns {Promise}
   */
  sendMessage(conversationRef, data) {
    return conversationRef
      .collection(this.COLLECTION_NAME)
      .doc()
      .set(this.sanitize.data(data));
  }

  /**
   * Deletes All Messages
   *
   * @returns {Promise}
   */
  async deleteAllMessages(conversationID) {
    return firebase.firestore()
      .collection('conversations')
      .doc(conversationID)
      .collection(this.COLLECTION_NAME)
      .get()
      .then((snapshot) => {
        const batch = firebase.firestore().batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      });
  }
}

export default new MessagesModel();
