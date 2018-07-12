import _ from 'lodash';

export default class FirestoreSanitizer {
  constructor(COLLECTION_PROPS) {
    if (!COLLECTION_PROPS || COLLECTION_PROPS.length === 0) {
      throw new Error('Firestore Sanitizer must be initialized with COLLECTION_PROPS');
    }
    this.COLLECTION_PROPS = COLLECTION_PROPS;
  }

  data(data) {
    return _.pick(data, this.COLLECTION_PROPS);
  }

  document(doc) {
    const data = this.data(doc.data());

    // Do any general (not collection-specific) firestore data-massaging below
    const convertedData = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value) {

        // Convert firestore Timestamp objects into JS Date objects
        if (typeof value === 'object' && typeof value.toDate === 'function') {
          convertedData[key] = value.toDate();
        }

      }
    });

    // Attach the id field manually, since firestore doesn't attach this when calling doc.data()
    return { ...data, ...convertedData, id: doc.id };
  }

  collectionSnapshot(snapshot) {
    return snapshot.docs.map((doc) => {
      return this.document(doc);
    });
  }
}
