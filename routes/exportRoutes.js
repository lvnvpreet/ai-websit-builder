const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const exportController = require('../controllers/exportController');

// Show export options for all websites
router.get('/export', ensureAuth, exportController.getExportOptions);

// Show export options for a specific website
router.get('/export/:id', ensureAuth, exportController.getExportOptions);

// Export a website
router.post('/export/:id', ensureAuth, exportController.exportWebsite);

module.exports = router;