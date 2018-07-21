import _ from 'lodash';
import { userSelector } from './user.selector';

function getOtherMember(members, myID) {
  return Object.keys(members).find(id => id !== myID);
}

export const friendsLoadingSelector = (state) => {
  return _.get(state, 'friends.loading', null);
};

export const friendsSelector = (state) => {
  return _.get(state, 'friends.data', []);
};

export const friendConnectionsLoadingSelector = (state) => {
  return _.get(state, 'friendConnections.loading', null);
};

export const friendConnectionsSelector = (state) => {
  return _.get(state, 'friendConnections.data', []);
};

export const composedFriendsLoadingSelector = (state) => {
  return friendsLoadingSelector(state) || friendConnectionsLoadingSelector(state);
};

export const composedFriendsSelector = (state) => {
  const user = userSelector(state);
  const friends = friendsSelector(state);
  const friendConnections = friendConnectionsSelector(state);
  return friendConnections.map((connection) => {
    const friendID = getOtherMember(connection.members, user.uid);
    return {
      ...connection,
      friend: friends.find(f => f.id === friendID),
    };
  });
};
