const User = require('../models/User');

// Show the register page
exports.getRegister = (req, res) => {
  res.render('auth/register');
};

// Register user
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('auth/register', { 
        error: 'User already exists',
        name,
        email
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    await user.save();
    
    // Set session
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { 
      error: 'Server error',
      name: req.body.name,
      email: req.body.email
    });
  }
};

// Show the login page
exports.getLogin = (req, res) => {
  res.render('auth/login');
};

// Login user
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { 
        error: 'Invalid credentials',
        email
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.render('auth/login', { 
        error: 'Invalid credentials',
        email
      });
    }

    // Set session
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { 
      error: 'Server error',
      email: req.body.email
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
};