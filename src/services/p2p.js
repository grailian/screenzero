import Peer from 'simple-peer';
import { shareScreen } from './renderer';
const {ipcRenderer} = window.require('electron')

/**
 * Converts an array buffer to a string
 *
 * @param uint8arr {Uint8Array} - The buffer to convert
 * @param callback {Function} - The function to call when conversion is complete
 */
function largeuint8ArrToString(uint8arr, callback) {
  const bb = new Blob([uint8arr]);
  const f = new FileReader();
  f.onload = function (e) {
    callback(e.target.result);
  };

  f.readAsText(bb);
}

class P2P {
  constructor() {
    this.localPeer = null;
    this.myStream = null;
  }

  async addTrack(sendScreen) {
    const newStream = await this.getStream(sendScreen);
    console.log('newStream.getTracks()', newStream.getTracks());
    const track = newStream.getTracks()[0];
    return this.localPeer.addTrack(track, this.myStream);
  }

  getStream(sendScreen) {
    if (sendScreen) {
      return shareScreen();
    }
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  }

  async connectToFriend(useVideo) {
    console.log('this.localPeer', this.localPeer);
    if (this.localPeer && this.localPeer.connected) {
      throw new Error('A connected local peer already exists! You probably just want to add a track');
    }

    try {
      this.myStream = await this.getStream(useVideo);

      console.log('this.myStream.id', this.myStream.id);

      // Create a peer connection
      this.localPeer = this.newPeer(true, this.myStream);
      return this.localPeer;
    } catch (err) {
      console.error('failed to getUserMedia', err);
    }
  }

  async acceptOffer(incomingSignal) {
    if (!incomingSignal) {
      throw new Error('You must pass in a signal in order to join a connection!');
    }
    if (incomingSignal.type !== 'offer') {
      throw new Error('You must pass in an "offer" signal in order to join a connection!');
    }
    if (this.localPeer) {
      throw new Error('Peer connection already exists, cannot accept any further offers!');
    }
    if (this.myStream) {
      throw new Error('Local Peer stream already exists, which is weird!');
    }

    try {
      this.myStream = await this.getStream();

      console.log('this.myStream.id', this.myStream.id);

      // Join the peer connection
      this.localPeer = this.newPeer(false, this.myStream);
      this.localPeer.signal(incomingSignal);
      return this.localPeer;
    } catch (err) {
      console.error('failed to getUserMedia', err);
    }
  }

  async acceptAnswer(incomingSignal) {
    if (!incomingSignal) {
      throw new Error('You must pass in a signal in order to finalize a connection!');
    }
    if (incomingSignal.type !== 'answer') {
      throw new Error('You must pass in an "answer" signal in order to finalize a connection!');
    }
    if (!this.localPeer) {
      throw new Error('Peer connection does not exist, cannot accept an answer!');
    }

    // Finalize the peer connection
    this.localPeer.signal(incomingSignal);
    return this.localPeer;
  }

  newPeer(initiator, stream) {
    console.log('initiator', initiator);
    this.localPeer = new Peer({
      initiator, stream, trickle: false
    });
    this.localPeer.on('signal', this.onSignal.bind(this));
    this.localPeer.on('stream', this.onStream.bind(this));
    this.localPeer.on('connect', this.onConnect.bind(this));
    this.localPeer.on('close', this.onClose.bind(this));
    this.localPeer.on('track', this.onTrack.bind(this));
    this.localPeer.on('error', this.onError.bind(this));
    this.localPeer.on('data', this.onData.bind(this));
    return this.localPeer;
  }

  onConnect() {
    this.localPeer.send(JSON.stringify({ type: 'chat', content: 'hey peer' }));
    console.log('onConnect 🙋🙋🙋🙋🙋');
    if (typeof this._onConnect === 'function') {
      this._onConnect();
    }
    return this;
  }

  setOnConnect(callback) {
    this._onConnect = callback;
  }

  onTrack(track, stream) {
    console.log('onTrack track', track);
    if (typeof this._onTrack === 'function') {
      this._onTrack(track, stream);
    }
    return this;
  }

  setOnTrack(callback) {
    this._onTrack = callback;
  }

  onData(data) {
    largeuint8ArrToString(data, (string) => {
      try {
        const parsed = JSON.parse(string);
        if (parsed.type === 'chat') {
          console.log('got chat message', parsed.content);
        } else if(parsed.type === 'mouseMove'){
          this.handleMouseMove(parsed.payload)
        } else if(parsed.type === 'mouseClick'){
          this.handleMouseClick(parsed.payload)
        }
        if (parsed.type && parsed.sdp) {
          this.localPeer.signal(parsed);
        }
      } catch (e) {
        console.log('e', e);
      }
    });
    if (typeof this._onData === 'function') {
      this._onData(data);
    }
    return this;
  }

  setOnData(callback) {
    this._onData = callback;
  }

  handleMouseMove(payload){
    // console.log('mouseMove', payload)
    const scaleX = window.screen.availWidth / payload.w
    const scaleY = window.screen.availHeight / payload.h
    ipcRenderer.send('mouseMove', {x: payload.x * scaleX, y: payload.y * scaleY})
  }

  handleMouseClick(payload){
    console.log('mouseClick', payload)
    const scaleX = window.screen.availWidth / payload.w
    const scaleY = window.screen.availHeight / payload.h
    ipcRenderer.send('mouseClick', {x: payload.x * scaleX, y: payload.y * scaleY})
  }

  sendMessage(type, payload){
    console.log('sendMessage', type, payload)
    this.localPeer.send(JSON.stringify({type, payload}))
  }


  onSignal(signal) {
    console.log('signal', signal)
    if (signal.type) {
      // console.log('🗼🗼🗼🗼🗼🗼 You should relay this signal:', signal.type);
      if (this.localPeer && this.localPeer.connected) {
        // console.log('sending signal over data channel');
        this.localPeer.send(JSON.stringify(signal));
      } else if (typeof this._onSignal === 'function') {
        this._onSignal(signal);
      }
    } else {
      // console.log('🗼🗼🗼🗼🗼🗼 DO NOT relay this signal:', signal);
    }
    return this;
  }

  setOnSignal(callback) {
    this._onSignal = callback;
  }

  onStream(stream) {
    console.log('onStream ┏(-_-)┛┗(-_-﻿ )┓┗(-_-)┛┏(-_-)┓', stream.id);
    if (typeof this._onStream === 'function') {
      this._onStream(stream);
    }
    return this;
  }

  setOnStream(callback) {
    this._onStream = callback;
  }

  onError(err) {
    console.error('P2P error!', err);
    if (typeof this._onError === 'function') {
      this._onError(err);
    }
    return this;
  }

  setOnError(callback) {
    this._onError = callback;
  }

  onClose() {
    if (typeof this._onClose === 'function') {
      this._onClose();
    }
    this.localPeer = false;
    return this;
  }

  setOnClose(callback) {
    this._onClose = callback;
  }
}

export default new P2P();
