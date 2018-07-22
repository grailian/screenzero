import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';
import Messages from './messages.model';

class ConversationsModel {
  constructor() {
    this.sanitize = new FirestoreSanitizer(this.COLLECTION_PROPS);
  }

  /**
   * Firestore collection name
   *
   * @type {string}
   */
  COLLECTION_NAME = 'conversations';


  /**
   * List of available properties for documents in this collections
   *
   * @type {string[]}
   */
  COLLECTION_PROPS = [
    'members',
    'presenterID',
  ];

  collectionRef = firebase.firestore().collection(this.COLLECTION_NAME);

  subscriptions = {
    conversations: () => null,
  };

  /**
   * Subscribe to the user's list of chatMessages
   *
   * @returns {Listener}
   */
  listenForConversations(userID) {
    return new Listener((onUpdate, onError) => {

      // Cancel any existing firestore watchers
      this.subscriptions.conversations();
      this.subscriptions.conversations = this.collectionRef
        .where(`members.${userID}`, '==', true)
        .onSnapshot((snapshot) => {
          let conversations = this.sanitize.collectionSnapshot(snapshot);

          conversations.forEach(conversation => {
            Messages.listenForMessages(this.collectionRef.doc(conversation.id))
              .listen((messages) => {
                conversations = conversations.map(c => {
                  if (c.id === conversation.id) {
                    return { ...conversation, messages };
                  }
                  return c;
                });
                onUpdate(conversations);
              });
          });
        }, onError);
    });
  }

  /**
   * Send a chatMessage
   *
   * @returns {Promise}
   */
  sendMessageToConversation(conversationID, data) {
    const conversationRef = this.collectionRef.doc(conversationID);
    return Messages.sendMessage(conversationRef, data);
  }

  /**
   * Fetches a conversation by ID
   *
   * @param convoID
   * @returns {Promise<>}
   */
  async getByID(convoID) {
    const doc = await this.collectionRef
      .doc(convoID)
      .get();
    if (doc.exists) {
      return this.sanitize.document(doc);
    }
    return null;
  }

  /**
   * Creates a new conversation
   *
   * @param members
   * @returns {Promise<>}
   */
  async createConversation(members) {
    const ref = this.collectionRef.doc();
    await ref.set(this.sanitize.data({ members }));
    return this.getByID(ref.id);
  }
}

export default new ConversationsModel();
