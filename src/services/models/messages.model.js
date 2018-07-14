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
    'sentDate'
  ];

  TYPES = {
    CHAT: 'CHAT',
    P2P_INIT: 'P2P_INIT',
    P2P_CONNECT: 'P2P_CONNECT'
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
   * Subscribe to the user's list of chatMessages
   *
   * @returns {Listener}
   */
  listenForP2PInit(conversationID) {
    console.log('listenp2pinit')
    return new Listener((onUpdate, onError) => {
      const collectionRef = firebase.firestore()
        .collection('conversations')
        .doc(conversationID)
        .collection(this.COLLECTION_NAME)

      this.subscriptions.p2pInit();
      this.subscriptions.p2pInit = collectionRef
        .where('type', '==', this.TYPES.P2P_INIT)
        .orderBy('sentDate', 'asc')
        .limit(1)
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
          console.log(messages)
          onUpdate(messages);
        }, onError);
    });
  }

  listenForP2PConnect(conversationID) {
    console.log('listenp2pconnect')
    return new Listener((onUpdate, onError) => {
      const collectionRef = firebase.firestore()
        .collection('conversations')
        .doc(conversationID)
        .collection(this.COLLECTION_NAME)

      this.subscriptions.p2pConnect();
      this.subscriptions.p2pConnect = collectionRef
        .where('type', '==', this.TYPES.P2P_CONNECT)
        .orderBy('sentDate', 'asc')
        .limit(1)
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
          console.log(messages)
          onUpdate(messages);
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
}

export default new MessagesModel();
