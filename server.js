const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const sequelize = require('./config');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure Handlebars as the template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// Set up static directory
app.use(express.static('public'));

// Routes

// Home route
app.get('/', async (req, res) => {
  try {
    // Retrieve existing blog posts
    const posts = await Post.findAll({ order: [['createdAt', 'DESC']], include: User });

    res.render('home', {
      posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

// Login route
app.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user with the provided username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Set the user as logged in
    req.session.loggedIn = true;
    req.session.userId = user.id;

    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Signup route
app.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/dashboard');
  } else {
    res.render('signup');
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({ username, password: hashedPassword });

    // Set the user as logged in
    req.session.loggedIn = true;
    req.session.userId = newUser.id;

    res.status(200).json({ message: 'Signed up and logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    // Retrieve blog posts created by the current user
    const posts = await Post.findAll({ where: { UserId: req.session.userId } });

    res.render('dashboard', {
      posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve dashboard' });
  }
});

// Single post route
app.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Retrieve the post with comments and associated user
    const post = await Post.findOne({
      where: { id: postId },
      include: [{ model: User }, { model: Comment, include: User }],
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.render('post', {
      post,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// New post route
app.get('/new-post', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/login');
    return;
  }

  res.render('new-post', {
    loggedIn: req.session.loggedIn,
  });
});

app.post('/new-post', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const { title, content } = req.body;

    // Create a new post
    const newPost = await Post.create({ title, content, UserId: req.session.userId });

    res.status(200).json({ message: 'New post created successfully', postId: newPost.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create new post' });
  }
});

// Update post route
app.get('/update-post/:id', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const postId = req.params.id;

    // Retrieve the post with the provided id
    const post = await Post.findOne({ where: { id: postId, UserId: req.session.userId } });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.render('update-post', {
      post,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

app.put('/update-post/:id', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const postId = req.params.id;
    const { title, content } = req.body;

    // Update the post with the provided id
    await Post.update({ title, content }, { where: { id: postId, UserId: req.session.userId } });

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post route
app.delete('/delete-post/:id', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const postId = req.params.id;

    // Delete the post with the provided id
    await Post.destroy({ where: { id: postId, UserId: req.session.userId } });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Add comment route
app.post('/comment/:postId', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const postId = req.params.postId;
    const { content } = req.body;

    // Create a new comment for the post
    await Comment.create({ content, PostId: postId, UserId: req.session.userId });

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Sync Sequelize models and start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
