import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import PhoneIcon from '@material-ui/icons/Phone';
import DeleteIcon from '@material-ui/icons/Delete';
import ScreenShare from '@material-ui/icons/ScreenShare';
import { sendChatMessage } from '../data/actions/conversations.actions';
import { connectToFriend } from '../data/actions/p2p.actions';
import { friendsSelector } from '../data/selectors/friends.selector';
import { remoteStreamSelector } from '../data/selectors/p2p.selector';
import { userSelector } from '../data/selectors/user.selector';
import { conversationsSelector, currentConversationSelector } from '../data/selectors/conversations.selector';
import Messages from '../services/models/messages.model';
import Offers from '../services/models/offers.model';
import Answers from '../services/models/answers.model';
import P2P from '../services/p2p'

class Friends extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    friends: PropTypes.array,
  };

  static defaultProps = {
    user: null,
    friends: [],
    conversations: [],
  };

  state = {
    message: '',
    videoWidth: null,
    videoHeight: null
  };

  componentDidMount() {
  }

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

  onConnect = (useVideo) => {
    this.props.connectToFriend(this.props.conversation.id, useVideo);
  };

  onChange = (field) => {
    return (event) => {
      this.setState({
        [field]: event.target.value,
      });
    };
  };

  delete = () => {
    Messages.deleteAllMessages(this.props.conversation.id);
    Offers.deleteAllOffers(this.props.conversation.id);
    Answers.deleteAllAnswers(this.props.conversation.id);
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
    if (this.props.conversation && this.props.conversation.messages) {
      return this.props.conversation.messages.map((item) => {
        if (item.type === Messages.TYPES.P2P_OFFER || item.type === Messages.TYPES.P2P_ANSWER) {
          // return item.content;
          return (
            <div key={item.id}>
              {item.type}
            </div>
          );
        }
        return (
          <div key={item.id}>
            {item.content}
          </div>
        );
      });
    }
    return null;
  };

  mouseMoveHandler(event){
    // console.log(event)
  }

  mouseClickHandler(event){
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    console.log(x, y, rect.width, rect.height)
    P2P.sendMessage('mouseClick', {x, y, w: rect.width, h: rect.height})
  }

  renderVideo = () => {
    if(this.props.remoteStream){
      return (
        <video
          style={{ height: '750px', overflow: 'hidden' }}
          autoPlay
          playsInline
          onClick={this.mouseClickHandler.bind(this)}
          onMouseMove={this.mouseMoveHandler.bind(this)}
          ref={(video) => {
            if (video && this.props.remoteStream) {
              // console.log('this.props.remoteStream.getTracks()', this.props.remoteStream.getTracks());
              video.srcObject = this.props.remoteStream;
            }
          }}
        />
      );
    }
    return null
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
            <h4>
              Chat
              <IconButton
                onClick={this.delete}
                disabled={this.props.loading}
              >
                <DeleteIcon />
              </IconButton>
            </h4>
            <div style={{ overflow: 'hidden' }}>
              {this.renderChatMessages()}
            </div>
          </div>
        </Paper>
        <div style={{ height: '750px', overflow: 'hidden' }}>
          {this.renderVideo()}
        </div>
        <form style={styles.inputContainer} noValidate onSubmit={this.onSubmit}>
          <TextField
            label="Message"
            type="email"
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

            <IconButton
              onClick={this.onConnect.bind(this, false)}
              disabled={this.props.loading}>
              <PhoneIcon />
            </IconButton>

            <IconButton
              onClick={this.onConnect.bind(this, true)}
              disabled={this.props.loading}>
              <ScreenShare />
            </IconButton>
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
    conversations: conversationsSelector(state),
    remoteStream: remoteStreamSelector(state),
    conversation: currentConversationSelector(state),
  };
};

const mapDispatchToProps = { sendChatMessage, connectToFriend };

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
