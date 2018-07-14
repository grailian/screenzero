import Listener from '../../helpers/Listener';
import firebase from '../firebase.service';
import FirestoreSanitizer from './FirestoreSanitizer';
import Messages from './messages.model';
import P2P from '../p2p'

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
    'presenterID'
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
          const conversations = this.sanitize.collectionSnapshot(snapshot);
          console.log(conversations)
          conversations.forEach(conversation => {
            Messages.listenForMessages(this.collectionRef.doc(conversation.id))
              .listen(messages => {
                const convos = conversations.map(c => {
                  if(c.id === conversation.id){
                    return {
                      ...conversation,
                      messages
                    }
                  }
                  return c
                })
                onUpdate(convos);
              })
          })

        }, onError);
    });
  }

  /**
   * Send a chatMessage
   *
   * @returns {Promise}
   */
  sendMessageToConversation(conversationID, data) {
    const conversationRef = this.collectionRef.doc(conversationID)
    return Messages.sendMessage(conversationRef, data)
  }


  createConversation(data) {
    return this.collectionRef
      .doc()
      .set(this.sanitize.data(data));
  }
}

export default new ConversationsModel();
