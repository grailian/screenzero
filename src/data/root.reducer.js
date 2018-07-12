import { combineReducers } from 'redux';
import user from './reducers/user.reducer';
import friends from './reducers/friends.reducer';
import chatMessages from './reducers/chatMessages.reducer';

const rootReducer = combineReducers({
  user,
  friends,
  chatMessages,
});

export default rootReducer;
