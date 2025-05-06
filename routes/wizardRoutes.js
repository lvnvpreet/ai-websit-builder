const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const wizardController = require('../controllers/wizardController');

// All wizard routes require authentication
router.use(ensureAuth);

// Entry point for the wizard
router.get('/', wizardController.getBusinessInfo);

// Step 1: Business Information
router.get('/business-info', wizardController.getBusinessInfo);
router.post('/business-info', wizardController.postBusinessInfo);

// Step 2: Website Information
router.get('/website-info', wizardController.getWebsiteInfo);
router.post('/website-info', wizardController.postWebsiteInfo);

// Step 3: Theme Selection
router.get('/theme', wizardController.getTheme);
router.post('/theme', wizardController.postTheme);

// Step 4: Website Structure
router.get('/structure', wizardController.getStructure);
router.post('/structure', wizardController.postStructure);

// Step 5: Footer Information
router.get('/footer', wizardController.getFooter);
router.post('/footer', wizardController.postFooter);

// Step 6: Additional Features
router.get('/features', wizardController.getFeatures);
router.post('/features', wizardController.postFeatures);

// Summary page
router.get('/summary', wizardController.getSummary);
router.post('/generate', wizardController.saveWebsite);

module.exports = router;