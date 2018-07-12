import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const configsByProjectID = {
  'screen-zero-dev': {
    apiKey: 'AIzaSyDqx6NsnuIwqE-hmJsz2sO7n3Xme6_77aU',
    authDomain: 'screen-zero-dev.firebaseapp.com',
    databaseURL: 'https://screen-zero-dev.firebaseio.com',
    projectId: 'screen-zero-dev',
    storageBucket: 'screen-zero-dev.appspot.com',
    messagingSenderId: '894340081839',
  },
};

export const config = configsByProjectID[process.env.REACT_APP_FIREBASE_PROJECT_ID];
firebase.initializeApp(config);

firebase.firestore().settings({
  timestampsInSnapshots: true,
});

export default firebase;
