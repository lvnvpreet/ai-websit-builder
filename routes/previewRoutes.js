const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const previewController = require('../controllers/previewController');

// Preview dashboard
router.get('/websites/:id/preview', ensureAuth, previewController.getPreviewDashboard);

// Preview specific page
router.get('/preview/:websiteId/page/:pageId', ensureAuth, previewController.previewPage);

// Preview responsive (different device sizes)
router.get('/preview/:websiteId/responsive/:pageId/:device', ensureAuth, previewController.previewResponsive);

module.exports = router;