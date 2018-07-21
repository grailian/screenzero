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
   * Fetch a user's profile by User.uid
   *
   * @param userID {string} User.uid of the profile to fetch
   * @returns {Promise<>}
   */
  async getByID(userID) {
    const snapshot = await this.collectionRef
      .doc(userID)
      .get();
    if (snapshot.exists) {
      return this.sanitize.document(snapshot);
    }
    return null;
  }

  /**
   * Fetch a user's profile by email
   *
   * @param email {string} email of the profile to fetch
   * @returns {Promise<>}
   */
  async getByEmail(email) {
    const snapshot = await this.collectionRef
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snapshot.size === 1) {
      return this.sanitize.collectionSnapshot(snapshot)[0];
    }
    return null;
  }
}

export default new ProfilesModel();
