import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class AnswersModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'answers';

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  PARENT_COLLECTION_NAME = 'conversations';

  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'signal',
    'fromID',
    'toID',
    'sentDate',
  ];

  parentCollectionRef = firebase.firestore().collection(this.PARENT_COLLECTION_NAME);

  subscriptions = {
    cancelAnswers: () => null,
  };

  /**
   * Subscribe to incoming P2P answer messages
   *
   * @param conversationID
   * @param userID - Current user's ID
   * @returns {Listener}
   */
  listenForP2PAnswers(conversationID, userID) {
    return new Listener((onUpdate, onError) => {

      this.subscriptions.cancelAnswers();
      this.subscriptions.cancelAnswers = this.parentCollectionRef
        .doc(conversationID)
        .collection(this.COLLECTION_NAME)
        .where('toID', '==', userID)
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
   * Send a p2p answer
   *
   * @returns {Promise}
   */
  sendAnswer(conversationID, data) {
    return this.parentCollectionRef
      .doc(conversationID)
      .collection(this.COLLECTION_NAME)
      .doc()
      .set(this.sanitize.data({
        ...data,
        sentDate: firebase.firestore.FieldValue.serverTimestamp(),
      }));
  }

  /**
   * Deletes All Answers
   *
   * @returns {Promise}
   */
  async deleteAllAnswers(conversationID) {
    return this.parentCollectionRef
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

export default new AnswersModel();
