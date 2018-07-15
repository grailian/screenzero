// import React from 'react';
// import { addStream, addChannel } from '../services/peer';
// import { shareScreen } from '../services/renderer';
//
// class MyScreen extends React.Component {
//   state = {
//     connected: false,
//     stream: null,
//   };
//
//   componentWillReceiveProps(props) {
//     if (props.peer) {
//       this.setState({ connected: true });
//     }
//   }
//
//   gotStream = (stream) => {
//     this.setState({ stream });
//     this.video.srcObject = this.state.stream;
//     // this.props.peer.addStream(stream);
//     // createPeerConnection(true, stream);
//     addStream(this.props.peer, stream);
//   };
//
//   shareScreen = () => {
//     if (this.state.connected) {
//       shareScreen()
//         .then(this.gotStream)
//         .catch(console.warn);
//     }
//   };
//
//   renderVideo = () => {
//     return (
//       <video autoPlay
//              playsInline
//              ref={(video) => this.video = video}
//       />
//     );
//   };
//
//   render() {
//     return (
//       <div>
//         <div>
//           <button onClick={this.shareScreen}
//                   disabled={!this.state.connected}
//           >
//             Share My Screen Nao
//           </button>
//         </div>
//         <div style={{ display: this.state.stream ? 'block' : 'none' }}>
//           <h3>Sharing My Screen</h3>
//           {this.renderVideo()}
//         </div>
//       </div>
//     );
//   }
// }
//
// export default MyScreen;
