import _ from 'lodash';

export const conversationsSelector = (state) => {
  return _.get(state, 'conversations.data', null);
};
