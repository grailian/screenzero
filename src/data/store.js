import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './root.reducer';
import thunkMiddleware from 'redux-thunk';
import ReduxDevTools from '../components/ReduxDevTools';

// setup middleware
let enhancer = compose(
  applyMiddleware(thunkMiddleware),
);

if (process.env.NODE_ENV !== 'production') {
  // Enable Redux DevTools with the monitors you chose
  enhancer = compose(enhancer, ReduxDevTools.instrument());
}

export default createStore(rootReducer, enhancer);
