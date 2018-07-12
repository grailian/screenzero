import _ from 'lodash';

export const userLoadingSelector = (state) => {
  return _.get(state, 'user.loading', null);
};

export const userSelector = (state) => {
  return _.get(state, 'user.data', null);
};
