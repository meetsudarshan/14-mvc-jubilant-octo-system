const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Post extends Model {}

Post.init(
  {
    // ... other post model attributes
  },
  {
    sequelize,
    modelName: 'Post',
  }
);

module.exports = Post;
