import React from 'react';
import { addChannel, getDataChannel } from '../services/peer';
import { getPeer, setHostPin, startConnection } from '../services/signal2';

class Chat extends React.Component {
  state = {
    message: '',
    messages: [],
    dataChannel: null,
  };

  async componentWillReceiveProps(props) {
    // if (props.peer) {
    //   this.setState({ connected: true });
    //   console.log('PEER connected');
    //
    //   const dataChannel = await addChannel(props.peer);
    //   console.log('dataChannel', dataChannel);
    //   this.setState({ dataChannel });
    //   props.peer.ondatachannel = (event) => {
    //     console.log('ondatachannel:', event.channel);
    //     const dataChannel = event.channel;
    //     this.onDataChannelCreated(dataChannel);
    //     this.setState({ dataChannel });
    //   };
    // }
  }

  onDataChannelCreated = (channel) => {
    channel.onmessage = (event) => {
      console.log('event.data', event.data);
      // addChatMessage('Peer:' + event.data);
    };
  };

  sendMessage = () => {
    // const dataChannel = this.state.dataChannel;
    // console.log('dataChannel', dataChannel);
    //
    // if (!dataChannel) {
    //   console.warn('Connection has not been initiated. Get two peers in the same room first');
    //   return;
    // } else if (dataChannel.readyState === 'closed') {
    //   console.warn('Connection was lost. Peer closed the connection.');
    //   return;
    // } else if (dataChannel.readyState !== 'open') {
    //   console.warn('Connection not ready: ' + dataChannel.readyState);
    //   return;
    // }
    // console.log('dataChannel.readyState', dataChannel.readyState);
    // dataChannel.send(this.state.message);
    // this.setState({
    //   messages: [...this.state.messages, 'ME: ' + this.state.message],
    // });

    const peer = getPeer();
    console.log('peer', peer);
    console.log('this.state.message', this.state.message);
    if (peer) {
      peer.send(JSON.stringify({ type: 'message', data: this.state.message }));
    }
  };

  sendChat = (event) => {
    event.preventDefault();
    // if (!this.state.dataChannel) {
    // const dataChannel = addChannel(this.props.peer);
    // this.setState({ dataChannel }, this.sendMessage);
    // } else {
    this.sendMessage();
    // }
  };

  onChange = (event) => {
    this.setState({ message: event.target.value });
  };

  renderMessages = () => {
    return this.state.messages.map((msg, i) => {
      return (
        <div key={i}>{msg}</div>
      );
    });
  };

  render() {
    return (
      <div>
        <h3>Chat</h3>
        <form onSubmit={this.sendChat}>
          <input id="chatInput" type="text" value={this.state.message} onChange={this.onChange} />
          <button id="chatSendBtn">Share</button>
        </form>
        <div>
          {this.renderMessages()}
        </div>
      </div>
    );
  }
}

export default Chat;
