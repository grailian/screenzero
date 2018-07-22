import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { currentConversationSelector } from '../data/selectors/conversations.selector';
import { remoteStreamSelector } from '../data/selectors/p2p.selector';
import User from '../services/models/user.model';
import { userLoadingSelector, userSelector } from '../data/selectors/user.selector';
import Chat from './Chat';
import Friends from './Friends';
import Loading from './Loading';
import LoginOrRegister from './LoginOrRegister';
import RemoteScreen from './RemoteScreen';

class Router extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    user: PropTypes.object,
  };

  static defaultProps = {
    loading: true,
    user: null,
  };

  renderContent() {
    if (this.props.loading) {
      return <Loading />;
    }

    if (this.props.user) {
      if (this.props.remoteStream) {
        return <RemoteScreen />;
      }
      if (this.props.conversation) {
        return <Chat />;
      }
      return <Friends />;
    }

    return <LoginOrRegister />;
  }

  render() {
    return (
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit" style={{ flexGrow: 1 }}>
              ScreenZero
            </Typography>
            {this.props.user && this.props.user.email}
            <IconButton onClick={User.logout}>
              <AccountCircle />
            </IconButton>
          </Toolbar>
        </AppBar>
        {this.renderContent()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: userLoadingSelector(state),
    user: userSelector(state),
    conversation: currentConversationSelector(state),
    remoteStream: remoteStreamSelector(state),
  };
};

export default connect(mapStateToProps)(Router);
