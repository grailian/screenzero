import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

let timeout = null;
let peer = null;
let socket = null;
let sessionId = null;
let hostPin = null;
let serverStatus;
let peerStatus;

const updateServerConnectionStatus = (status, error) => {
  serverStatus = status;
};

const updatePeerConnectionStatus = (status, error) => {
  peerStatus = status;
};

const createPeer = (initiator, mediaStream) => {
  console.log('-----------createPeer-------------');
  peer = new SimplePeer({ initiator: initiator, trickle: false, objectMode: true, stream: mediaStream });

  peer.on('signal', data => {
    if (initiator) {
      socket.emit('offer_answer', { session_id: sessionId, offer: data });
    } else {
      socket.emit('offer_answer', { session_id: sessionId, answer: data });
    }
  });

  peer.on('connect', () => {
    console.log('Connected to peer'); // eslint-disable-line no-console
    updatePeerConnectionStatus('connected');
    socket.disconnect();
  });

  peer.on('data', (data) => {
    console.log('message', data); // eslint-disable-line no-console
    const parsed = JSON.parse(data);
    let type = null;
    let message = null;
    console.log('parsed', parsed);
  });

  peer.on('stream', stream => {
    const vendorURL = window.URL || window.webkitURL;
    const mediaSrc = vendorURL.createObjectURL(stream);
    // store.dispatch({
    //   type: types.PEER_MEDIA_STREAM_READY,
    //   stream: mediaSrc,
    // });
  });

  peer.on('close', () => {
    console.log('Peer connection lost, reconnecting to negotiation server...'); // eslint-disable-line
                                                                                // no-console
    updatePeerConnectionStatus('peer_connection_lost');
    socket.connect();
  });

  peer.on('error', (error) => {
    updatePeerConnectionStatus('peer_connection_error');
    console.log(error); // eslint-disable-line no-console
  });
};

export function getPeer() {
  return peer;
}

export function init(id) {
  sessionId = id;

  // getUserMedia((err, stream) => {
  //   if (err) {
  //     // TODO - show error message
  //     console.log('getUserMediaFailed', err); // eslint-disable-line no-console
  //   } else {
  //     const vendorURL = window.URL || window.webkitURL;
  //     const mediaSrc = vendorURL.createObjectURL(stream);
  //     store.dispatch({
  //       type: types.MEDIA_STREAM_READY,
  //       stream: mediaSrc,
  //     });
  //     startConnection(stream);
  //   }
  // });
}

function identify() {
  console.log('socket', socket);
  console.log('sessionId', sessionId);
  console.log('hostPin', hostPin);
  if (socket) {
    socket.emit('identify', { id: sessionId, pin: hostPin });
  }
}

export function setHostPin(pin, reident) {
  hostPin = pin;
  if (reident) {
    identify();
  }
}

export function getHostPin() {
  return hostPin;
}

export function startConnection(mediaStream) {
  // socket = io('https://api.livescoop.com/');
  socket = io('http://localhost:8080');

  console.log('startConnection', socket);

  socket.on('connect', () => {
    console.log('Connected to negotiation server'); // eslint-disable-line no-console
    updateServerConnectionStatus('connect');
    identify();
  });

  socket.on('send_identity', () => {
    identify();
  });

  socket.on('connect_error', (err) => {
    console.log('connect_error', err); // eslint-disable-line no-console
    updateServerConnectionStatus('connect_error', err);
  });

  socket.on('connect_timeout', (err) => {
    console.log('connect_timeout', err); // eslint-disable-line no-console
    updateServerConnectionStatus('connect_timeout', err);
  });

  socket.on('reconnect', (err) => {
    console.log('reconnect', err); // eslint-disable-line no-console
    updateServerConnectionStatus('reconnect', err);
  });

  socket.on('reconnect_error', (err) => {
    console.log('reconnect_error', err); // eslint-disable-line no-console
    updateServerConnectionStatus('reconnect_error', err);
  });

  socket.on('reconnect_failed', (err) => {
    console.log('reconnect_failed', err); // eslint-disable-line no-console
    updateServerConnectionStatus('reconnect_failed', err);
  });

  socket.on('waiting', payload => {
    console.log('Waiting for other user to connect...', payload); // eslint-disable-line no-console
    const error = (hostPin && !payload.host) ? 'Invalid Host PIN' : null;
    if (error) {
      setHostPin(null, false);
    }
    updateServerConnectionStatus('waiting', error);
  });

  socket.on('send_offer', () => {
    console.log('Sending offer'); // eslint-disable-line no-console
    updateServerConnectionStatus('send_offer');
    clearTimeout(timeout);
    timeout = null;
    createPeer(true, mediaStream);
  });

  socket.on('send_answer', offer => {
    console.log('Sending answer'); // eslint-disable-line no-console
    updateServerConnectionStatus('send_answer');
    clearTimeout(timeout);
    timeout = null;
    createPeer(false, mediaStream);
    peer.signal(offer);
  });

  socket.on('complete_connection', answer => {
    console.log('Completing connection!'); // eslint-disable-line no-console
    updateServerConnectionStatus('complete_connection');
    peer.signal(answer);
  });

  socket.on('disconnect', () => {
    console.log('Disconnect from negotiation server'); // eslint-disable-line no-console
    updateServerConnectionStatus('disconnect');
  });

  socket.on('invalid_identity', () => {
    console.log('invalid_identity, do not attempt to reconnect'); // eslint-disable-line no-console
    updateServerConnectionStatus('invalid_identity');
  });
}

export function sendMessage() {

}
