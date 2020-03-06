const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setup static directory to serve
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

io.on('connection', socket => {
  socket.emit('message', 'Welcome@');

  socket.broadcast.emit('message', 'A new user has joined!');

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    }

    io.emit('message', msg);
    callback('Delivered');
  });

  socket.on('sendLocation', (data, callback) => {
    io.emit(
      'message',
      `https://google.com/maps?q=${data.latitude},${data.longitude}`
    );

    callback('Location Shared');
  });

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left!');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
