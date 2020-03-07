const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormBtn = $messageForm.querySelector('button');
const $sendLocationBtn = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $roomTitleBar = document.querySelector('#room-title-bar');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const roomTitleBarTemplate = document.querySelector('#room-title-bar-template')
  .innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', message => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });

  $sidebar.innerHTML = html;
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

  const html = Mustache.render(roomTitleBarTemplate, {
    titleBar: room.toLowerCase()
  });
  $roomTitleBar.innerHTML = html;
});
