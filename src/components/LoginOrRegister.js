import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

class LoginOrRegister extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
  };

  state = {
    mode: 'LOGIN',
  };

  switchModeToLogin = () => {
    this.setState({ mode: 'LOGIN' });
  };

  switchModeToCreate = () => {
    this.setState({ mode: 'CREATE' });
  };

  renderLogin = () => {
    console.log('------------renderlogin------------');
    return (
      <div style={styles.container}>
        <LoginForm
          email="ian@codehangar.io"
          onSwitchMode={this.switchModeToCreate}
        />
        <LoginForm
          email="aaron@aaronblankenship.com"
          onSwitchMode={this.switchModeToCreate}
        />
      </div>
    );
  };

  renderRegister = () => {
    console.log('------------render register------------');
    return (
      <div style={styles.container}>
        <RegisterForm
          onSwitchMode={this.switchModeToLogin}
        />
      </div>
    );
  };

  render() {
    console.log('this.state.mode', this.state.mode);
    if (this.state.mode === 'LOGIN') {
      return this.renderLogin();
    }
    return this.renderRegister();
  }
}

const styles = {
  container: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
  },
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LoginOrRegister);
