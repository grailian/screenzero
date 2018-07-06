import React from 'react';
import { addChannel } from '../services/peer';

class RemoteScreen extends React.Component {
  state = {
    connected: false,
    stream: null,
  };

  componentWillReceiveProps(props) {
    if (props.peer) {
      this.setState({ connected: true });
      console.log('PEER connected');
      props.peer.onaddstream = this.gotStream;
    }
  }

  gotStream = (event) => {
    console.log('------------------------');
    const stream = event.stream;
    console.log('this.video', this.video);
    console.log('stream', stream);
    this.setState({ stream });
    this.video.srcObject = stream;
    // this.props.peer.ondatachannel = function (event) {
    //   console.log('ondatachannel:', event.channel);
    //   const dataChannel = event.channel;
    //   this.onDataChannelCreated(dataChannel);
    // };
    // addChannel(this.props.peer);
  };

  renderVideo = () => {
    return (
      <video autoPlay
             playsInline
             ref={(video) => this.video = video}
      />
    );
  };

  render() {
    return (
      <div>
        <div style={{ display: this.state.stream ? 'block' : 'none' }}>
          <h3>Viewing Remote Screen</h3>
          {this.renderVideo()}
        </div>
      </div>
    );
  }
}

export default RemoteScreen;
