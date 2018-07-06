import React from 'react';
import logo from '../logo.svg';
import '../css/App.css';
import { init, setHostPin, startConnection } from '../services/signal2';
import Chat from './Chat';
import MyScreen from './MyScreen';
import RemoteScreen from './RemoteScreen';
// import { socket, room } from '../services/signal2';
import { createPeerConnection } from '../services/peer';

class App extends React.Component {
  state = {
    isInitiator: false,
    peer: null,
    dataChannel: null,
  };

  componentDidMount() {
    init('test');
    setHostPin('test', true);
    startConnection();

    // Joining a room.
    // socket.emit('create or join', room);
    console.log('🈴🈴🈴joining');
    // socket.on('ready', (room) => {
    //   console.log('Socket is ready', room);
    //   if (!this.state.peer) {
    //     const peer = createPeerConnection();
    //     this.setState({ peer });
    //   }
    // });
    // socket.on('created', (room, clientId) => {
    //   console.log('Created room', room, '- my client ID is', clientId);
    //   const isInitiator = true;
    //   this.setState({ isInitiator });
    //   createPeerConnection(isInitiator)
    //     .then(({ peer, dataChannel }) => {
    //       this.setState({ peer, dataChannel });
    //     })
    //     .catch((error) => {
    //       console.log('error', error);
    //     });
    //   // shareScreen().then(gotStream).catch(console.warn);
    // });
    //
    // socket.on('joined', (room, clientId) => {
    //   console.log('This peer has joined room', room, 'with client ID', clientId);
    //   const isInitiator = false;
    //   this.setState({ isInitiator });
    //   createPeerConnection(isInitiator)
    //     .then(({ peer, dataChannel }) => {
    //       this.setState({ peer, dataChannel });
    //     })
    //     .catch((error) => {
    //       console.log('error', error);
    //     });
    //   // grabWebCamVideo();
    // });
  }

  disconnect = () => {
    // socket.disconnect();
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">ScreenZero</h1>
          <button onClick={this.disconnect}>Disconnect</button>
        </header>
        <MyScreen peer={this.state.peer} />
        <RemoteScreen peer={this.state.peer} />
        <Chat peer={this.state.peer} />
      </div>
    );
  }
}

export default App;
