const Todo = require('./todo');
const User = require('./user');

const db = require('../db');

User.hasMany(Todo);

module.exports = {
  Todo,
  User,

  db,
};
