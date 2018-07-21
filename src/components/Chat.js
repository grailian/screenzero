import spacing from '@material-ui/core/styles/spacing';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { sendChatMessage } from '../data/actions/conversations.actions';
import { currentConversationSelector } from '../data/selectors/conversations.selector';
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
        return (
          <div key={item.id}>
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
          Chat
        </h4>
        <div style={{ overflow: 'scroll' }}>
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
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
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
  };
};

const mapDispatchToProps = {
  sendChatMessage,
};


export default connect(mapStateToProps, mapDispatchToProps)(Chat);
