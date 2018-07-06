import * as Peer from './peer';

const io = require('socket.io-client')('http://localhost:8080');
// const io = require('socket.io-client')('https://signalserver.herokuapp.com');


// Connect to the signaling server
export const socket = io.connect();

/****************************************************************************
 * Initial setup
 ****************************************************************************/

  // Create a random room if not already present in the URL.
let isInitiator;
// let room = window.location.hash.substring(1);
export const room = 'test';


/****************************************************************************
 * Signaling server
 ****************************************************************************/


socket.on('created', function (room, clientId) {
  console.log('Created room', room, '- my client ID is', clientId);
  isInitiator = true;
  // shareScreen().then(gotStream).catch(console.warn);
});

socket.on('joined', function (room, clientId) {
  console.log('This peer has joined room', room, 'with client ID', clientId);
  isInitiator = false;
  Peer.createPeerConnection(isInitiator);
  // grabWebCamVideo();
});

socket.on('full', function (room) {
  alert('Room ' + room + ' is full. We will create a new room for you.');
  window.location.hash = '';
  window.location.reload();
});

socket.on('ready', function () {
  console.log('Socket is ready');
  Peer.createPeerConnection(isInitiator);
});

socket.on('log', function (array) {
  // console.log.apply(console, array);
});

socket.on('message', function (message) {
  console.log('Client received message:', message.type);
  Peer.signalingMessageCallback(message);
});

// Leaving rooms and disconnecting from peers.
socket.on('disconnect', function (reason) {
  console.log(`Disconnected: ${reason}.`);
});

socket.on('bye', function (room) {
  console.log(`Peer leaving room ${room}.`);
  // If peer did not create the room, re-enter to be creator.
  if (!isInitiator) {
    window.location.reload();
  }
});

window.addEventListener('unload', function () {
  console.log(`Unloading window. Notifying peers in ${room}.`);
  socket.emit('bye', room);
});


/****************************************************************************
 * User media (webcam)
 ****************************************************************************/

function gotStream(stream) {
  console.log('getUserMedia video stream URL:', stream);
  Peer.createPeerConnection(isInitiator, stream);
}

/**
 * Send message to signaling server
 */
export function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

