import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';

class Login extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
  };

  state = {
    email: '',
    password: 'password',
  };

  render() {
    return (
      <div style={styles.container}>
        <LoginForm email="ian@codehangar.io" />
        <LoginForm email="aaron@aaronblankenship.com" />
      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
