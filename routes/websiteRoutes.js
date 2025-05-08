// File location: routes/websiteRoutes.js

const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const websiteController = require('../controllers/websiteController');

// List all websites for the logged-in user
router.get('/', ensureAuth, websiteController.getAllWebsites);

// Get details for a specific website
router.get('/:id', ensureAuth, websiteController.getWebsiteDetails);

// Delete a website
router.delete('/:id', ensureAuth, websiteController.deleteWebsite);

// Additional website routes as needed...

module.exports = router;