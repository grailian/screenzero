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
    P2P: 'P2P'
  };

  subscriptions = {
    messages: () => null,
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
    console.log('convo ref', conversationRef)
    return conversationRef
      .collection(this.COLLECTION_NAME)
      .doc()
      .set(this.sanitize.data(data));
  }
}

export default new MessagesModel();
