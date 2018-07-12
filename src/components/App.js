import React from 'react';
import { Provider } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { initialize } from '../data/actions/auth.actions';
import store from '../data/store';
import ReduxDevTools from './ReduxDevTools';
import Router from './Router';

let devTools = <ReduxDevTools store={store} />;
if (process.env.NODE_ENV === 'production') {
  devTools = null;
}

// https://cimdalli.github.io/mui-theme-generator/
const muiTheme = createMuiTheme();

class App extends React.Component {
  componentDidMount() {
    store.dispatch(initialize());
  }

  render() {
    return (
      <MuiThemeProvider theme={muiTheme}>
        {devTools}
        <CssBaseline />
        <Provider store={store}>
          <Router />
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
