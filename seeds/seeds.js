// Import necessary dependencies
const { sequelize, User, Post, Comment } = require('../models'); // Update with your actual model file paths

// Define your seed data
const userData = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
  // Add more user data if needed
];

const postData = [
  { title: 'Post 1', content: 'Lorem ipsum dolor sit amet.', userId: 1 },
  { title: 'Post 2', content: 'Lorem ipsum dolor sit amet.', userId: 2 },
  // Add more post data if needed
];

const commentData = [
  { text: 'Comment 1', userId: 1, postId: 1 },
  { text: 'Comment 2', userId: 2, postId: 1 },
  // Add more comment data if needed
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Sync the models with the database
    await sequelize.sync({ force: true });

    // Create users
    const users = await User.bulkCreate(userData);

    // Create posts
    const posts = await Post.bulkCreate(postData);

    // Create comments
    const comments = await Comment.bulkCreate(commentData);

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Call the seedDatabase function to start seeding
seedDatabase();
