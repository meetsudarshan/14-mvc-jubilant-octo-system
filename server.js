const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const sequelize = require('./config/connection');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const routes = require('./controllers');

// Initialize models and define associations
const models = { Post, User };
Post(models);
User(models);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

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

// Dashboard route
app.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    // Retrieve the logged-in user's posts
    const posts = await Post.findAll({ where: { user_id: req.session.userId }, include: User });

    res.render('dashboard', {
      posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve user posts' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  // Clear the session data
  req.session.destroy(() => {
    res.status(204).end();
  });
});

// Post route
app.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    // Retrieve the blog post with its associated comments and author
    const post = await Post.findOne({
      where: { id: postId },
      include: [{ model: User }, { model: Comment, include: User }],
    });

    if (!post) {
      res.status(404).json({ error: 'No post found with this id' });
      return;
    }

    res.render('post', {
      post,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve blog post' });
  }
});

// API routes
app.use('/api', routes);

// Sync Sequelize models and start the Express app
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
});
