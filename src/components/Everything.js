import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import spacing from '@material-ui/core/styles/spacing';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import PhoneIcon from '@material-ui/icons/Phone';
import ScreenShare from '@material-ui/icons/ScreenShare';
import { connectToFriend } from '../data/actions/p2p.actions';
import { friendsSelector } from '../data/selectors/friends.selector';
import { userSelector } from '../data/selectors/user.selector';
import { conversationsSelector, currentConversationSelector } from '../data/selectors/conversations.selector';
import Messages from '../services/models/messages.model';
import Offers from '../services/models/offers.model';
import Answers from '../services/models/answers.model';
import P2P from '../services/p2p';
import Chat from './Chat';
import Friends from './Friends';
import RemoteScreen from './RemoteScreen';

class Everything extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    friends: PropTypes.array,
  };

  static defaultProps = {
    user: null,
    friends: [],
    conversations: [],
  };

  state = {};

  componentDidMount() {
  }

  onConnect = (useVideo) => {
    this.props.connectToFriend(this.props.conversation.id, useVideo);
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
      );
    });
  };

  render() {
    return (
      <div style={styles.container}>
        <Paper style={styles.contentContainer}>
          <Friends />
          <Chat />
        </Paper>
        <div style={{ flex: 1 }}>
          <RemoteScreen />
        </div>
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
    conversation: currentConversationSelector(state),
  };
};

const mapDispatchToProps = { connectToFriend };

export default connect(mapStateToProps, mapDispatchToProps)(Everything);
