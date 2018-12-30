const crypto = require('crypto');
const Sequelize = require('sequelize');
const db = require('../db');

const User = db.define('user', {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  fullName: {
    type: Sequelize.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  imageUrl: {
    type: Sequelize.STRING,
    defaultValue:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-ptSnkhNvY4isw-xlwHEnoMRTf-sMkhlrxRIJChGjWco1omaiPQ',
  },
  password: {
    type: Sequelize.STRING,
    // Making `.password` act like a func hides it when serializing to JSON.
    // This is a hack to get around Sequelize's lack of a "private" option.
    get() {
      return () => this.getDataValue('password');
    },
    // allowNull: false
    // validate:{
    //   notEmpty: true
    // }
  },
  salt: {
    type: Sequelize.STRING,
    get() {
      return () => this.getDataValue('salt');
    },
  },
  googleId: {
    type: Sequelize.STRING,
  },
});

module.exports = User;
//instanceMethods

User.prototype.correctPassword = function(candidatePassword) {
  return (
    User.encryptPassword(candidatePassword, this.salt()) === this.password()
  );
};

//classMethods

User.generateSalt = function() {
  return crypto.randomBytes(16).toString('base64');
};

User.encryptPassword = function(plainText, salt) {
  return crypto
    .createHash('RSA-SHA256')
    .update(plainText)
    .update(salt)
    .digest('hex');
};

const setSaltAndPassword = user => {
  if (user.changed('password')) {
    user.salt = User.generateSalt();
    user.password = User.encryptPassword(user.password(), user.salt());
  }
};

User.beforeCreate(setSaltAndPassword);
User.beforeUpdate(setSaltAndPassword);
