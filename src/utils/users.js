const users = [];

//? addUser, removeUser, getUser, getUsersInRoom

//! Add User
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    };
  }

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: `${existingUser.username} is in use!`
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);

  return { user };
};

//! Remove User
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//! Get a User
const getUser = id => {
  const user = users.find(user => user.id === id);

  // Validate user
  if (!user) {
    return {
      error: `User not found!`
    };
  }

  return user;
};

//! Get all Users in room
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  const getUsers = users.filter(user => user.room === room);

  // Validate user
  if (getUsers.length === 0) {
    return {
      error: 'This room is empty.'
    };
  }

  return getUsers;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
