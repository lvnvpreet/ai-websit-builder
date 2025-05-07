const User = require('../models/User');

module.exports = {
  ensureAuth: async function (req, res, next) {
    if (req.session.userId) {
      try {
        // Fetch the user and attach to the request
        const user = await User.findById(req.session.userId);
        if (user) {
          req.user = user;
          return next();
        } else {
          // User ID exists in session but not in database
          req.session.destroy();
          return res.redirect('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        return res.redirect('/login');
      }
    } else {
      return res.redirect('/login');
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.session.userId) {
      return next();
    } else {
      res.redirect('/dashboard');
    }
  }
};