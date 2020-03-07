const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setup static directory to serve
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

io.on('connection', socket => {
  socket.emit('message', generateMessage('Welcome!'));

  socket.broadcast.emit('message', generateMessage('A new user has joined!'));

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback('Profanity is not allowed!');
    } else if (msg.length === 0) {
      return callback('The message is required!');
    }

    io.emit('message', generateMessage(msg));
    callback('Delivered');
  });

  socket.on('sendLocation', (data, callback) => {
    io.emit(
      'locationMessage',
      generateLocationMessage(
        `https://google.com/maps?q=${data.latitude},${data.longitude}`
      )
    );

    callback('Location Shared');
  });

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left!'));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
