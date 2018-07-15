import _ from 'lodash';

export const remoteStreamLoadingSelector = (state) => {
  return _.get(state, 'p2p.loading', null);
};

export const remoteStreamSelector = (state) => {
  return _.get(state, 'p2p.data', null);
};
