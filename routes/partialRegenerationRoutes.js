// routes/partialRegenerationRoutes.js
const express = require('express');
const router = express.Router();
const partialRegenerationController = require('../controllers/partialRegenerationController');
const { ensureAuth } = require('../middleware/auth');

// All routes require authentication
router.use(ensureAuth);

// GET /page-editor/:websiteId/:pageId - Render page editor
router.get('/:websiteId/:pageId', partialRegenerationController.getPageEditor);

// POST /page-editor/:websiteId/:pageId/regenerate - Regenerate entire page
router.post('/:websiteId/:pageId/regenerate', partialRegenerationController.regeneratePage);

// POST /page-editor/:websiteId/:pageId/section/:sectionId/regenerate - Regenerate specific section
router.post('/:websiteId/:pageId/section/:sectionId/regenerate', partialRegenerationController.regenerateSection);

// POST /page-editor/:websiteId/:pageId/section/add - Add new section
router.post('/:websiteId/:pageId/section/add', partialRegenerationController.addNewSection);

module.exports = router;
