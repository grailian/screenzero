import _ from 'lodash';

export const conversationsLoadingSelector = (state) => {
  return _.get(state, 'conversations.loading', null);
};

export const conversationsSelector = (state) => {
  return _.get(state, 'conversations.data', null);
};

export const currentConversationSelector = (state) => {
  return _.get(state, 'conversations.selected', null);
};
