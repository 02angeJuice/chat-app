const socket = io();

socket.on('message', msg => {
  console.log(msg);
});

document.getElementById('formChat').addEventListener('submit', e => {
  const input = document.getElementById('formInput').value;

  socket.emit('sendMessage', input);

  e.preventDefault();
});
