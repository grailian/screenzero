import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

class ProfilesModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'profiles';

  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'email',
    'displayName',
    'photoURL',
    'createdDate',
    'updatedDate',
  ];

  collectionRef = firebase.firestore().collection(this.COLLECTION_NAME);

  subscriptions = {};

  /**
   * Save a user's profile
   *
   * @param userID {string} User.uid of the profile to fetch
   * @param data {object} profile data to save
   * @returns {Promise<>}
   */
  create(userID, data) {
    return this.collectionRef
      .doc(userID)
      .set(this.sanitize.data({
        ...data,
        createdDate: firebase.firestore.FieldValue.serverTimestamp(),
        updatedDate: firebase.firestore.FieldValue.serverTimestamp(),
      }));
  }

  /**
   * Update a user's profile
   *
   * @param userID {string} User.uid of the profile to fetch
   * @param data {object} profile data to save
   * @returns {Promise<>}
   */
  update(userID, data) {
    return this.collectionRef
      .doc(userID)
      .update(this.sanitize.data({
        ...data,
        updatedDate: firebase.firestore.FieldValue.serverTimestamp(),
      }));
  }

  /**
   * Fetch a user's profile
   *
   * @param userID {string} User.uid of the profile to fetch
   * @returns {Promise<>}
   */
  async get(userID) {
    const snapshot = await this.collectionRef
      .doc(userID)
      .get();
    if (snapshot.exists) {
      return this.sanitize.document(snapshot);
    }
    return null;
  }
}

export default new ProfilesModel();
