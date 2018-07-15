import Peer from 'simple-peer';
import { shareScreen } from './renderer';

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

      console.log('this.myStream.id', this.myStream.getTracks());

      // Create a peer connection
      this.localPeer = this.newPeer(true, this.myStream);
      return this.localPeer;
    } catch (err) {
      console.error('failed to getUserMedia', err);
    }
  }

  async joinConnectionToFriend(signal) {
    if (!signal) {
      throw new Error('You must pass in a signal in order to join a connection!');
    }

    if (this.localPeer) {
      // Signal the peer
      console.log('final signal');
      this.localPeer.signal(signal);
      return this.localPeer;
    }

    try {
      this.myStream = await this.getStream();

      console.log('this.myStream.id', this.myStream.id);

      // Join a peer connection
      this.localPeer = this.newPeer(false, this.myStream);
      this.localPeer.signal(signal);
      console.log('signal', signal);
      return this.localPeer;
    } catch (err) {
      console.error('failed to getUserMedia', err);
    }
  }

  newPeer(initiator, stream) {
    console.log('initiator', initiator);
    this.localPeer = new Peer({ initiator, stream, trickle: false });
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
    this.localPeer.send('hey peer');
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
    console.log('got data', data);
    if (typeof this._onData === 'function') {
      this._onData(data);
    }
    return this;
  }

  setOnData(callback) {
    this._onData = callback;
  }

  onSignal(signal) {
    if (signal.type) {
      console.log('signal 🗼🗼🗼🗼🗼🗼', signal.type);
    } else {
      console.log('signal 🗼🗼🗼🗼🗼🗼', signal);
    }
    if (typeof this._onSignal === 'function') {
      this._onSignal(signal);
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
