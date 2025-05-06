const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const { 
  getLogin, 
  postLogin, 
  getRegister, 
  postRegister, 
  logout 
} = require('../controllers/authController');

// Home route
router.get('/', (req, res) => {
  res.render('index', {
    user: req.session.userId ? true : false
  });
});

// Login routes
router.get('/login', ensureGuest, getLogin);
router.post('/login', ensureGuest, postLogin);

// Register routes
router.get('/register', ensureGuest, getRegister);
router.post('/register', ensureGuest, postRegister);

// Logout route
router.get('/logout', ensureAuth, logout);

// Dashboard route (protected)
router.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard');
});

module.exports = router;