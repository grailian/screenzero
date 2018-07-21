import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import User from '../services/models/user.model';
import { userLoadingSelector, userSelector } from '../data/selectors/user.selector';
import Loading from './Loading';
import LoginOrRegister from './LoginOrRegister';
import Friends from './Friends';

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
    } else if (this.props.user) {
      return <Friends />;
    } else {
      return <LoginOrRegister />;
    }
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
  };
};

export default connect(mapStateToProps)(Router);
