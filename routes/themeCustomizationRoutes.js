// routes/themeCustomizationRoutes.js
const express = require('express');
const router = express.Router();
const themeCustomizationController = require('../controllers/themeCustomizationController');
const { ensureAuth } = require('../middleware/auth');

// All routes require authentication
router.use(ensureAuth);

// GET /theme-customization/:id - Render theme customization page
router.get('/:id', themeCustomizationController.getThemeCustomizer);

// POST /theme-customization/:id - Save theme customizations
router.post('/:id', themeCustomizationController.saveThemeCustomizations);

// POST /theme-customization/:id/apply - Apply theme to website
router.post('/:id/apply', themeCustomizationController.applyThemeToWebsite);

// POST /theme-customization/:id/preview - Preview theme changes in real-time
router.post('/:id/preview', themeCustomizationController.previewTheme);

module.exports = router;
