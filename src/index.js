const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Setup static directory to serve
const publicDirPath = path.join(__dirname, '../public');
app.use(express.static(publicDirPath));

app.get('/', (req, res) => {
  res.render('index.html');
});

io.on('connection', socket => {
  socket.on('sendMessage', msg => {
    console.log(msg);
    io.emit('message', msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
