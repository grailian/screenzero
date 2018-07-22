import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
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

  getConversationWithFriend = (friend) => {
    const convo = this.props.conversations.find(c => !!c.members[friend.id]);
    if (convo) {
      return convo;
    }
    return this.props.createConversation(this.props.user.uid, friend.id);
  };

  startAudioCall = async (friend) => {
    const convo = await this.getConversationWithFriend(friend);
    this.props.connectToFriend(convo, false);
  };

  startSharingScreen = async (friend) => {
    const convo = await this.getConversationWithFriend(friend);
    this.props.connectToFriend(convo, true);
  };

  setCurrentConversation = async (friend) => {
    const convo = await this.getConversationWithFriend(friend);
    this.props.selectConversation(convo.id);
  };

  renderFriendsList = () => {
    return this.props.friends.map((item) => {
      return (
        <ListItem key={item.id}>
          <ListItemText
            primary={item.friend && item.friend.email}
            secondary={item.status}
            onClick={() => this.setCurrentConversation(item.friend)}
          />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => this.startAudioCall(item.friend)}
              disabled={this.props.loading}>
              <PhoneIcon />
            </IconButton>
            <IconButton
              onClick={() => this.startSharingScreen(item.friend)}
              disabled={this.props.loading}>
              <ScreenShare />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
      // { /*<div key={item.id}>*/ }
      // {/*<div onClick={() => this.setCurrentConversation(item.friend)}>*/}
      // {/*{item.friend && item.friend.email}*/}
      // {/*</div>*/}
      //
      // {/*<IconButton*/}
      // {/*onClick={() => this.startAudioCall(item.friend)}*/}
      // {/*disabled={this.props.loading}>*/}
      // {/*<PhoneIcon />*/}
      // {/*</IconButton>*/}
      //
      // {/*</div>*/}
    });
  };

  renderForm = () => {
    return (
      <form style={styles.inputContainer} noValidate onSubmit={this.onSubmit}>
        <TextField
          label="Email of contact to add"
          type="email"
          // margin="none"
          value={this.state.email}
          style={{ flexGrow: 1 }}
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
        <div style={{ overflow: 'scroll', flexGrow: 1 }}>
          <List dense>
            {this.renderFriendsList()}
          </List>
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
    user: userSelector(state),
    loading: composedFriendsLoadingSelector(state),
    friends: composedFriendsSelector(state),
    conversations: conversationsSelector(state),
    conversation: currentConversationSelector(state),
  };
};

const mapDispatchToProps = {
  connectToFriend,
  sendFriendRequest,
  selectConversation,
  createConversation,
};

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
