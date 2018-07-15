import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class ChatMessagesModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'chatMessages';


  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'message',
    'from',
    'conversationID',
  ];

  collectionRef = firebase.firestore().collection(this.COLLECTION_NAME);

  subscriptions = {
    chatMessages: () => null,
  };

  /**
   * Subscribe to the user's list of chatMessages
   *
   * @returns {Listener}
   */
  listenForChatMessages() {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      this.subscriptions.chatMessages();
      this.subscriptions.chatMessages = this.collectionRef.onSnapshot((snapshot) => {
        const chatMessages = this.sanitize.collectionSnapshot(snapshot);
        onUpdate(chatMessages);
      }, onError);
    });
  }

  /**
   * Send a chatMessage
   *
   * @returns {Promise}
   */
  sendChatMessage(data) {
    return this.collectionRef
      .doc()
      .set(this.sanitize.data(data));
  }
}

export default new ChatMessagesModel();
