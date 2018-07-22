import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import BackIcon from '@material-ui/icons/ArrowBack';
import spacing from '@material-ui/core/styles/spacing';
import TextField from '@material-ui/core/TextField';
import { selectConversation, sendChatMessage } from '../data/actions/conversations.actions';
import { currentConversationSelector } from '../data/selectors/conversations.selector';
import { friendsSelector } from '../data/selectors/friends.selector';
import { userSelector } from '../data/selectors/user.selector';
import Messages from '../services/models/messages.model';

class Chat extends React.Component {
  static propTypes = {
    conversation: PropTypes.object,
  };

  static defaultProps = {
    conversation: null,
  };

  state = {
    message: '',
  };


  getOtherMember = () => {
    if (this.props.conversation && this.props.user) {
      const friendID = Object.keys(this.props.conversation.members).find(id => id !== this.props.user.uid);
      if (friendID && this.props.friends) {
        const friend = this.props.friends.find(f => f.id === friendID);
        return friend ? friend.email : '';
      }
    }
    return '';
  };

  onChange = (field) => {
    return (event) => {
      this.setState({
        [field]: event.target.value,
      });
    };
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.props.sendChatMessage(this.props.conversation.id, {
      senderID: this.props.user.uid,
      content: this.state.message,
      type: Messages.TYPES.CHAT,
      sentDate: new Date(),
    });
    this.setState({ message: '' });
  };

  renderChatMessages = () => {
    if (this.props.conversation && this.props.conversation.messages) {
      return this.props.conversation.messages.map((item) => {
        const self = item.senderID === this.props.user.uid;
        return (
          <div key={item.id} style={{ alignSelf: self ? 'flex-end' : 'flex-start' }}>
            {item.content}
          </div>
        );
      });
    }
    return null;
  };

  renderForm = () => {
    if (this.props.conversation) {
      return (
        <form style={styles.inputContainer} noValidate onSubmit={this.onSubmit}>
          <TextField
            label="Message"
            type="text"
            // margin="normal"
            value={this.state.message}
            style={{ flexGrow: 1 }}
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
      );
    }
    return null;
  };

  render() {
    return (
      <div style={styles.container}>
        <h4>
          <IconButton
            onClick={() => this.props.selectConversation(null)}
            disabled={this.props.loading}>
            <BackIcon />
          </IconButton>
          Chat ({this.getOtherMember()})
        </h4>
        <div style={styles.contentContainer}>
          {this.renderChatMessages()}
        </div>
        {this.renderForm()}
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
    overflow: 'scroll',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    margin: spacing.unit,
  },
  wrapper: {
    margin: spacing.unit,
    position: 'relative',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: spacing.unit,
  },
};

const mapStateToProps = (state) => {
  return {
    conversation: currentConversationSelector(state),
    user: userSelector(state),
    friends: friendsSelector(state),
  };
};

const mapDispatchToProps = {
  sendChatMessage,
  selectConversation,
};


export default connect(mapStateToProps, mapDispatchToProps)(Chat);
