'use strict';
const os = require('os');
const nodeStatic = require('node-static');
const http = require('http');;
const socketIO = require('socket.io');

const PORT = 8090;

const app = http.createServer(function(req, res){}).listen(PORT);

const io = socketIO.listen(app);

io.sockets.on('connection', function(socket) {

   const roomName = 'r';

   socket.join(roomName);

   socket.on('pc1-conn-request', function() {
     console.log('Forward pc1 request');
     io.sockets.in(roomName).emit('pc1-conn-request');
   })

    socket.on('pc1-candidate', function(candidate) {
     console.log('Forward pc1 candidate');
     io.sockets.in(roomName).emit('pc1-candidate', candidate);
   })

    socket.on('pc1-offer', function(offer) {
     console.log('Forward pc1 offer');
     io.sockets.in(roomName).emit('pc1-offer', offer);
   })

    socket.on('pc2-candidate', function(candidate) {
     console.log('Forward pc2 candidate');
     io.sockets.in(roomName).emit('pc2-candidate', candidate);
   })

    socket.on('pc2-answer', function(answer) {
     console.log('Forward pc2 answer');
     io.sockets.in(roomName).emit('pc2-answer', answer);
   })

})