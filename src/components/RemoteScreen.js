import React from 'react';
import { connect } from 'react-redux';
import { remoteStreamSelector } from '../data/selectors/p2p.selector';
import P2P from '../services/p2p';
const MOUSE_EVENT_DELAY = 5
let lastMouseMove = Date.now()
let lastMouseClick = Date.now()

let sendMouseDownEvent = null
let sendMouseUpEvent = null

class RemoteScreen extends React.Component {

  mouseMoveHandler = (event) => {
    console.log('mouse move working')
    const now = Date.now()
    if(/*now - lastMouseMove > MOUSE_EVENT_DELAY &&*/ now - lastMouseClick > MOUSE_EVENT_DELAY * 50){
      lastMouseMove = now
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.pageX - rect.left;
      const y = event.pageY - rect.top;
      console.log(x, y, rect.width, rect.height);
      P2P.sendMessage('mouseMove', { x, y, w: rect.width, h: rect.height });
    }
  };

  mouseUpHandler = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    const button = getButton(event.button)
    console.log(x, y, rect.width, rect.height, button);
    sendMouseUpEvent = setTimeout(() => {
      P2P.sendMessage('mouseClick', { x, y, w: rect.width, h: rect.height, action: 'up', button });
    }, 50)
  };

  mouseDownHandler = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    const button = getButton(event.button)
    console.log(x, y, rect.width, rect.height, button);
    sendMouseDownEvent = setTimeout(() => {
      P2P.sendMessage('mouseClick', { x, y, w: rect.width, h: rect.height, action: 'down', button });
    }, 50)
  }

  mouseClickHandler = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const y = event.pageY - rect.top;
    const button = getButton(event.button)
    console.log(x, y, rect.width, rect.height, button);
    if(sendMouseDownEvent || sendMouseUpEvent){
      clearTimeout(sendMouseDownEvent)
      clearTimeout(sendMouseUpEvent)
      sendMouseDownEvent = null
      sendMouseUpEvent = null
      console.log('cancelled updown events')
    }
    lastMouseClick = Date.now()
    P2P.sendMessage('mouseClick', { x, y, w: rect.width, h: rect.height, action: 'click', button });
  }

  keyPressHandler = (event) => {
    const modifiers = []
    if(event.altKey) modifiers.push('ctrl')
    if(event.ctrlKey) modifiers.push('alt')
    if(event.shiftKey) modifiers.push('shift')
    if(event.metaKey) modifiers.push('win')

    P2P.sendMessage('keyPress', {
      keyCode: event.key,
      modifiers
    });
  }

  renderVideo = () => {
    if (this.props.remoteStream) {
      return (
        <video
          style={{ height: '750px', overflow: 'hidden', cursor: 'none' }}
          autoPlay
          playsInline
          onClick={this.mouseClickHandler}
          onMouseDown={this.mouseDownHandler}
          onMouseUp={this.mouseUpHandler}
          onMouseMove={this.mouseMoveHandler}
          onKeyPress={this.keyPressHandler}
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

const getButton = (button) => {
  switch(button) {
    case 0:
      return 'left'
    case 1:
      return 'middle'
    case 2:
      return 'right'
  }
}

const mapStateToProps = (state) => {
  return {
    remoteStream: remoteStreamSelector(state),
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RemoteScreen);
