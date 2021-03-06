import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { login } from '../data/actions/auth.actions';
import { userLoadingSelector } from '../data/selectors/user.selector';

class LoginForm extends React.Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    onSwitchMode: PropTypes.func.isRequired,
  };

  state = {
    email: this.props.email,
    password: 'password',
  };

  componentDidMount() {
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password);
  };

  onChange = (field) => {
    return (event) => {
      this.setState({
        [field]: event.target.value,
      });
    };
  };

  render() {
    return (
      <Paper style={styles.loginContainer}>
        <form style={styles.loginContainer} noValidate onSubmit={this.onSubmit}>
          <TextField
            label="Email"
            type="email"
            margin="normal"
            value={this.state.email}
            onChange={this.onChange('email')}
          />
          <TextField
            label="Password"
            type="password"
            margin="normal"
            value={this.state.password}
            onChange={this.onChange('password')}
          />

          <div style={styles.wrapper}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.props.loading}
            >
              Login
            </Button>
            {this.props.loading && <CircularProgress size={24} style={styles.buttonProgress} />}
          </div>
        </form>
        <hr />
        <Button
          disabled={this.props.loading}
          onClick={this.props.onSwitchMode}
        >
          Or Create New Account
        </Button>
      </Paper>
    );
  }
}

const styles = {
  loginContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    textAlign: 'center',
  },
  wrapper: {
    margin: spacing.unit,
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
};

const mapStateToProps = (state) => {
  return {
    loading: userLoadingSelector(state),
  };
};

const mapDispatchToProps = { login };

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
