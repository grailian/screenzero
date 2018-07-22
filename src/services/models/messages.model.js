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
  };

  subscriptions = {
    byConvoID: {},
  };

  /**
   * Subscribe to the user's list of chatMessages
   *
   * @returns {Listener}
   */
  listenForMessages(conversationRef) {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      if (this.subscriptions.byConvoID[conversationRef.id]) {
        this.subscriptions.byConvoID[conversationRef.id]();
      }
      this.subscriptions.byConvoID[conversationRef.id] = conversationRef
        .collection(this.COLLECTION_NAME)
        .orderBy('sentDate', 'asc')
        .onSnapshot((snapshot) => {
          const messages = this.sanitize.collectionSnapshot(snapshot);
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
