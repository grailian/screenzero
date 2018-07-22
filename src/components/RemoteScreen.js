import React from 'react';
import { connect } from 'react-redux';
import { remoteStreamSelector } from '../data/selectors/p2p.selector';
import P2P from '../services/p2p';

class RemoteScreen extends React.Component {

  mouseMoveHandler = (event) => {
    // console.log(event)
  };

  mouseClickHandler = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    console.log(x, y, rect.width, rect.height);
    P2P.sendMessage('mouseClick', { x, y, w: rect.width, h: rect.height });
  };

  renderVideo = () => {
    if (this.props.remoteStream) {
      return (
        <video
          style={{ height: '750px', overflow: 'hidden' }}
          autoPlay
          playsInline
          onClick={this.mouseClickHandler}
          onMouseMove={this.mouseMoveHandler}
          ref={(video) => {
            if (video && this.props.remoteStream) {
              // console.log('this.props.remoteStream.getTracks()', this.props.remoteStream.getTracks());
              video.srcObject = this.props.remoteStream;
            }
          }}
        />
      );
    }
    return null;
  };

  render() {
    return (
      <div style={{ flex: 1 }}>
        <h3>Viewing Remote Screen</h3>
        {this.renderVideo()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    remoteStream: remoteStreamSelector(state),
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RemoteScreen);
