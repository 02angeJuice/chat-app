const socket = io();

socket.on('message', msg => {
  console.log(msg);
});

document.getElementById('formChat').addEventListener('submit', e => {
  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, error => {
    if (error) {
      return console.log(error);
    }
    console.log('The message was deliver.');
  });

  e.preventDefault();
});

document.querySelector('#send-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('wrong');
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      getCall => {
        console.log(getCall);
      }
    );
  });
});
