import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { userLoadingSelector, userSelector } from '../data/selectors/user.selector';
import Loading from './Loading';
import Login from './Login';
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
      return <Login />;
    }
  }

  render() {
    return (
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="title" color="inherit">
            ScreenZero
          </Typography>
        </Toolbar>
        {this.renderContent()}
      </AppBar>
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
