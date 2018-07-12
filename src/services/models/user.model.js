import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';

// ***
// Module Exported Functions
// ***

class UserModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  // ***
  // Module Constants
  // ***

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
    'uid',
    'displayName',
    'email',
  ];

  onAuthStateChanged() {
    return new Listener((onUpdate) => {
      firebase.auth().onAuthStateChanged((authUser) => {
        if (authUser) {
          // User is signed in.
          const user = this.sanitize.data(authUser.toJSON());
          onUpdate(user);
        } else {
          // No user is signed in.
          onUpdate(null);
        }
      });
    });
  }

  /**
   * Creates a new user in Firebase, and returns a new instance of a User object (this class)
   *
   * @param email New user's email address
   * @param password New user's password
   * @return {Promise<firebase.User>} New User Object
   */
  async createNewUser(email, password) {
    // TODO: catch errors and handle them appropriately
    const authResult = await firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(email, password);
    return this.sanitize.data(authResult.user.toJSON());
  }

  /**
   * Logs in a user into Firebase, given an email address and password
   *
   * @param email User's email address
   * @param password User's password
   * @return {Promise<firebase.User>} User Object for the logged in user.
   */
  async login(email, password) {
    // TODO: catch errors and handle them appropriately
    console.log('email, password', email, password);
    const authResult = await firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password);
    console.log('authResult', authResult);
    return this.sanitize.data(authResult.user.toJSON());
  }

  /**
   * Grabs the currently authenticated user from Firebase.
   *
   * @return {firebase.User} Firebase User object
   */
  static currentUser() {
    return firebase.auth().currentUser;
  }

  /**
   * Grabs the currently authenticated user from Firebase.
   *
   * @param email User's email address
   * @return {Promise} Firebase User object
   */
  static async sendPasswordResetEmail(email) {
    if (email) {
      return firebase.auth().sendPasswordResetEmail(email);
    }
    return Promise.reject('Email is required');
  }

  /**
   * Re-Authenticates the currently logged in user
   *
   * @param currentPassword User's current password
   * @return {Promise} Firebase user object
   */
  async reAuthenticate(currentPassword) {
    // We need to throw this error manually, because the firebase library does not throw it
    // in a way we can catch it
    if (!currentPassword) {
      throw new Error('You must enter your password');
    }
    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    const authResult = await user.reauthenticateAndRetrieveDataWithCredential(credential);
    return this.sanitize.data(authResult.user.toJSON());
  };

  /**
   * Updates the password for the currently authenticated user from Firebase.
   *
   * @param currentPassword - User's current password
   * @param newPassword - User's new password
   * @return {Promise<string>} Success Message or Error
   */
  async updatePassword(currentPassword, newPassword) {
    // Require the user to enter a password for this sensitive operation
    await this.reAuthenticate(currentPassword);
    const user = firebase.auth().currentUser;
    await user.updatePassword(newPassword);
    return 'Password updated successfully!';
  }

  /**
   * Updates the email for the currently authenticated user from Firebase.
   *
   * @param password - User's current password
   * @param newEmail - User's new email address
   * @return {Promise<string>} Success Message or Error
   */
  async updateEmail(password, newEmail) {
    // Require the user to enter a password for this sensitive operation
    await this.reAuthenticate(password);
    const user = firebase.auth().currentUser;
    await user.updateEmail(newEmail);
    return 'Email updated successfully!';
  }

  /**
   * Logs out the currently authenticated user from Firebase.
   *
   * @return {Promise} Firebase User object
   */
  static async logout() {
    return firebase.auth().signOut();
  }


  /**
   * Deletes the currently logged in firebase user permanently
   *
   * @return {Promise<string>} Success Message or Error
   */
  static async deleteAccount() {
    const user = firebase.auth().currentUser;
    await user.delete();
    return 'User has been deleted successfully!';
  }
}

export default new UserModel();
