'use strict';

const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');
const socketIO = require('socket.io');

const fileServer = new (nodeStatic.Server)();
const app = http.createServer(function (req, res) {
  fileServer.serve(req, res);
}).listen(8080);

const io = socketIO.listen(app);
require('./webrtc')(io);
// io.sockets.on('connection', function (socket) {
//
//   // convenience function to log server messages on the client
//   function log() {
//     const array = ['Message from server:'];
//     array.push.apply(array, arguments);
//     socket.emit('log', array);
//   }
//
//   socket.on('message', function (message) {
//     log('Client said: ', message);
//     // for a real app, would be room-only (not broadcast)
//     socket.broadcast.emit('message', message);
//   });
//
//   socket.on('create or join', function (room) {
//     log('Received request to create or join room ' + room);
//
//     console.log('room', room);
//     const clientsInRoom = io.sockets.adapter.rooms[room];
//     const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
//     log('Room ' + room + ' now has ' + numClients + ' client(s)');
//     // console.log('numClients', numClients);
//
//     if (numClients === 0) {
//       socket.join(room);
//       log('Client ID ' + socket.id + ' created room ' + room);
//       socket.emit('created', room, socket.id);
//     } else {
//       // } else if (numClients === 1) {
//       log('Client ID ' + socket.id + ' joined room ' + room);
//       // io.sockets.in(room).emit('join', room);
//       socket.join(room);
//       socket.emit('joined', room, socket.id);
//       io.sockets.in(room).emit('ready', room);
//       socket.broadcast.emit('ready', room);
//       // } else { // max two clients
//       //   socket.emit('full', room);
//     }
//   });
//
//   socket.on('ipaddr', function () {
//     const ifaces = os.networkInterfaces();
//     for (const dev in ifaces) {
//       ifaces[dev].forEach(function (details) {
//         if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
//           socket.emit('ipaddr', details.address);
//         }
//       });
//     }
//   });
//
//   socket.on('disconnect', function (reason) {
//     console.log(`Peer or server disconnected. Reason: ${reason}.`);
//     socket.broadcast.emit('bye');
//   });
//
//   socket.on('bye', function (room) {
//     console.log(`Peer said bye on room ${room}.`);
//   });
// });
