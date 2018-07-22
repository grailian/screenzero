import _ from 'lodash';

export const conversationsLoadingSelector = (state) => {
  return _.get(state, 'conversations.loading', null);
};

export const conversationsSelector = (state) => {
  return _.get(state, 'conversations.data', null);
};

export const currentConversationSelector = (state) => {
  const id = _.get(state, 'conversations.selected', null);
  const conversations = conversationsSelector(state);
  return conversations.find(c => c.id === id);
};
