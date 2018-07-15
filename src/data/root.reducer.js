import { combineReducers } from 'redux';
import user from './reducers/user.reducer';
import friends from './reducers/friends.reducer';
import chatMessages from './reducers/chatMessages.reducer';
import conversations from './reducers/conversations.reducer';
import p2p from './reducers/p2p.reducer';

const rootReducer = combineReducers({
  user,
  friends,
  chatMessages,
  conversations,
  p2p,
});

export default rootReducer;
