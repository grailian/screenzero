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
    'members',
    'requestedBy',
    'requestedDate',
    'respondedDate',
    'status',
  ];

  /**
   * List of available values the friendship status property
   *
   * @type {object<string>}
   */
  STATUS = {
    REQUESTED: 'REQUESTED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
  };

  collectionRef = firebase.firestore().collection(this.COLLECTION_NAME);

  subscriptions = {
    friends: () => null,
  };

  /**
   * Subscribe to the user's list of friends
   *
   * @param userID {string} User.uid to listen for friends for
   * @returns {Listener}
   */
  listenForFriends(userID) {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      this.subscriptions.friends();
      this.subscriptions.friends = this.collectionRef
        .where(`members.${userID}`, '==', true)
        .onSnapshot((snapshot) => {
          const friends = this.sanitize.collectionSnapshot(snapshot);
          onUpdate(friends);
        }, onError);
    });
  }

  /**
   * Get a friendship between two users
   *
   * @param userID {string} User.uid of the the current user
   * @param friendID {string} Profile.id of the friend user
   * @returns {Promise}
   */
  async getFriendConnection(userID, friendID) {
    const snapshot = await this.collectionRef
      .where(`members.${userID}`, '==', true)
      .where(`members.${friendID}`, '==', true)
      .limit(1)
      .get();
    if (snapshot.size === 1) {
      return this.sanitize.collectionSnapshot(snapshot)[0];
    }
    return null;
  }

  /**
   * Send a new friend request
   *
   * @param userID {string} User.uid of the user sending the request
   * @param friendID {string} Profile.id of the user to request
   * @returns {Promise}
   */
  async sendRequest(userID, friendID) {
    const friendConnection = await this.getFriendConnection(userID, friendID);
    if (friendConnection) {
      throw new Error('A friendship connection already exists between these two users');
    }
    const newFriendship = {
      members: {
        [userID]: true,
        [friendID]: true,
      },
      requestedBy: userID,
      requestedDate: firebase.firestore.FieldValue.serverTimestamp(),
      respondedDate: null,
      status: this.STATUS.REQUESTED,
    };
    return this.collectionRef
      .doc()
      .set(this.sanitize.data(newFriendship));
  }
}

export default new FriendsModel();
