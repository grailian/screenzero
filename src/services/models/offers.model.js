import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class OffersModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'offers';

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
    byConvoID: {},
  };

  /**
   * Subscribe to incoming P2P offer messages
   *
   * @param conversationIDs
   * @param userID - Current user's ID
   * @returns {Listener}
   */
  listenForP2POffers(conversationIDs, userID) {
    return new Listener((onUpdate, onError) => {
      const offersByConvoID = {};
      conversationIDs.forEach(convoID => {
        if (this.subscriptions.byConvoID[convoID]) {
          this.subscriptions.byConvoID[convoID]();
        }
        this.subscriptions.byConvoID[convoID] = this.parentCollectionRef
          .doc(convoID)
          .collection(this.COLLECTION_NAME)
          .where('toID', '==', userID)
          .orderBy('sentDate', 'desc')
          .limit(1)
          .onSnapshot((snapshot) => {
            const messages = this.sanitize.collectionSnapshot(snapshot);
            if (messages.length > 0) {
              onUpdate({
                ...offersByConvoID,
                [convoID]: messages[0],
              });
            }
          }, onError);
      });
    });
  }

  /**
   * Send a p2p offer
   *
   * @returns {Promise}
   */
  sendOffer(conversationID, data) {
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
   * Deletes All Offers
   *
   * @returns {Promise}
   */
  async deleteAllOffers(conversationID) {
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

export default new OffersModel();
