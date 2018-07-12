import _ from 'lodash';

export const friendsSelector = (state) => {
  return _.get(state, 'friends.data', null);
};
