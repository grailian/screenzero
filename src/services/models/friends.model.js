import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class FriendsModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'friends';


  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'uid',
    'displayName',
    'email',
  ];

  collectionRef = firebase.firestore().collection(this.COLLECTION_NAME);

  subscriptions = {
    friends: () => null,
  };

  /**
   * Subscribe to the user's list of friends
   *
   * @returns {Listener}
   */
  listenForFriends() {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      this.subscriptions.friends();
      this.subscriptions.friends = this.collectionRef.onSnapshot((snapshot) => {
        const friends = this.sanitize.collectionSnapshot(snapshot);
        onUpdate(friends);
      }, onError);
    });
  }
}

export default new FriendsModel();
