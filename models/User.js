const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');
const Post = require('./Post');

class User extends Model {}

User.init(
  {
    // ... other user model attributes
  },
  {
    sequelize,
    modelName: 'User',
  }
);

User.hasMany(Post, { foreignKey: 'UserId' });

module.exports = User;
