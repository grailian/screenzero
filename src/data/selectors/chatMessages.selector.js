import _ from 'lodash';

export const chatMessagesSelector = (state) => {
  return _.get(state, 'chatMessages.data', null);
};
