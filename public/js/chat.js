const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on('message', msg => {
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  $messages.scrollTop = $messages.scrollHeight;
});

socket.on('locationMessage', url => {
  console.log(url);

  const html = Mustache.render(locationMessageTemplate, {
    location: url.url,
    createdAt: moment(url.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  $messages.scrollTop = $messages.scrollHeight;
});

$messageForm.addEventListener('submit', e => {
  $messageFormBtn.setAttribute('disabled', 'disabled');

  // Disable
  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, error => {
    // Enable
    $messageFormBtn.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('The message was deliver.');
  });

  e.preventDefault();
});

$sendLocationBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('wrong');
  }

  $sendLocationBtn.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      getCall => {
        $sendLocationBtn.removeAttribute('disabled');
        console.log(getCall);
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
