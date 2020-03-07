const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setup static directory to serve
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

io.on('connection', socket => {
  //! On Join
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      ...options
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage(`BOT #${user.room}`, 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('BOT', `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  //! On Send Message
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    } else if (message.trim().length === 0) {
      return callback('The message is required!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback('Delivered');
  });

  //! On Send Location
  socket.on('sendLocation', (data, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${data.latitude},${data.longitude}`
      )
    );

    callback('Location Shared');
  });

  //! On Disconnect
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('BOT', `${user.username} has left!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
