import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { sendChatMessage } from '../data/actions/chatMessages.actions';
import { chatMessagesSelector } from '../data/selectors/chatMessages.selector';
import { friendsSelector } from '../data/selectors/friends.selector';
import { userSelector } from '../data/selectors/user.selector';

class Friends extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    friends: PropTypes.array,
    chatMessages: PropTypes.array,
    sendChatMessage: PropTypes.func,
  };

  static defaultProps = {
    user: null,
    friends: [],
    chatMessages: [],
  };

  state = {
    message: '',
  };

  componentDidMount() {
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.props.sendChatMessage({
      from: this.props.user.uid,
      message: this.state.message,
      conversationID: 'ian-and-aaron',
    });
    this.setState({ message: '' });
  };

  onChange = (field) => {
    return (event) => {
      this.setState({
        [field]: event.target.value,
      });
    };
  };


  renderFriends = () => {
    return this.props.friends.map((item) => {
      return (
        <div key={item.id}>
          {item.id}
        </div>
      );
    });
  };

  renderChatMessages = () => {
    return this.props.chatMessages.map((item) => {
      return (
        <div key={item.id}>
          {item.id}
        </div>
      );
    });
  };

  render() {
    return (
      <div style={styles.container}>
        <Paper style={styles.contentContainer}>
          <div style={{ flexGrow: 1 }}>
            <h4>Friends</h4>
            {this.renderFriends()}
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4>Chat</h4>
            {this.renderChatMessages()}
          </div>
        </Paper>
        <form style={styles.inputContainer} noValidate onSubmit={this.onSubmit}>
          <TextField
            label="Message"
            type="email"
            // margin="normal"
            value={this.state.message}
            fullWidth
            onChange={this.onChange('message')}
          />
          <div style={styles.wrapper}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={this.props.loading}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

const styles = {
  container: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: spacing.unit,
  },
};

const mapStateToProps = (state) => {
  return {
    user: userSelector(state),
    friends: friendsSelector(state),
    chatMessages: chatMessagesSelector(state),
  };
};

const mapDispatchToProps = { sendChatMessage };

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
