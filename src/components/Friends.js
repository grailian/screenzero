import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import PhoneIcon from '@material-ui/icons/Phone';
import ScreenShare from '@material-ui/icons/ScreenShare';
import { sendFriendRequest } from '../data/actions/friends.actions';
import { connectToFriend } from '../data/actions/p2p.actions';
import { composedFriendsLoadingSelector, composedFriendsSelector } from '../data/selectors/friends.selector';
import { userSelector } from '../data/selectors/user.selector';
import { conversationsSelector, currentConversationSelector } from '../data/selectors/conversations.selector';
import { selectConversation, createConversation } from '../data/actions/conversations.actions';

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
    email: '',
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
    this.props.sendFriendRequest(this.state.email);
    this.setState({ email: '' });
  };

  startAudioCall = () => {
    this.props.connectToFriend(this.props.conversation.id, false);
  };

  startSharingScreen = () => {
    this.props.connectToFriend(this.props.conversation.id, true);
  };

  setCurrentConversation = (friend) => {
    if (friend.id) {
      // this.props.conversations
      let foundConvo = false;
      for (let i in this.props.conversations) {
        if (this.props.conversations[i].members[friend.id]) {
          this.props.selectConversation(this.props.conversations[i].id);
          foundConvo = true;
          break;
        }
      }

      if (!foundConvo) {
        this.props.createConversation(this.props.user.uid, friend.id);
        //TODO: probably not the best way to do this
        setTimeout(this.setCurrentConversation.bind(this, friend), 1000);
      }
    }
  };

  renderFriendsList = () => {
    return this.props.friends.map((item) => {
      return (
        <div key={item.id} onClick={this.setCurrentConversation.bind(this, item.friend)}>
          {item.friend && item.friend.email}

          <IconButton
            onClick={this.startAudioCall}
            disabled={this.props.loading}>
            <PhoneIcon />
          </IconButton>

          <IconButton
            onClick={this.startSharingScreen}
            disabled={this.props.loading}>
            <ScreenShare />
          </IconButton>
        </div>
      );
    });
  };

  renderForm = () => {
    return (
      <form style={styles.inputContainer} noValidate onSubmit={this.onSubmit}>
        <TextField
          label="Email of contact to add"
          type="email"
          margin="none"
          value={this.state.email}
          onChange={this.onChange('email')}
        />
        <div style={styles.wrapper}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={this.props.loading}
          >
            Add
          </Button>
        </div>
      </form>
    );
  };

  render() {
    return (
      <div style={styles.container}>
        <h4>Friends</h4>
        <div style={{ overflow: 'scroll' }}>
          {this.renderFriendsList()}
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
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: spacing.unit,
  },
};

const mapStateToProps = (state) => {
  return {
    user: userSelector(state),
    loading: composedFriendsLoadingSelector(state),
    friends: composedFriendsSelector(state),
    conversations: conversationsSelector(state),
    conversation: currentConversationSelector(state),
  };
};

const mapDispatchToProps = { connectToFriend, sendFriendRequest, selectConversation, createConversation };

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
