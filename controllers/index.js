// Import necessary models
const { User, Post, Comment } = require('./models');

// ...

// Home route
app.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({ include: User });

    res.render('home', {
      posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve posts' });
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
    const posts = await Post.findAll({ where: { UserId: req.session.userId }, include: User });

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
      include: [{ model: Comment, include: User }, User],
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
  } else {
    res.render('new-post', { loggedIn: req.session.loggedIn });
  }
});

app.post('/new-post', async (req, res) => {
  try {
    if (!req.session.loggedIn) {
      res.redirect('/login');
      return;
    }

    const { title, content } = req.body;

    // Create a new post associated with the current user
    await Post.create({ title, content, UserId: req.session.userId });

    res.status(200).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ...

