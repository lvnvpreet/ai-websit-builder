// routes/abTestingRoutes.js
const express = require('express');
const router = express.Router();
const abTestingController = require('../controllers/abTestingController');
const { ensureAuth } = require('../middleware/auth');

// All routes require authentication
router.use(ensureAuth);

// GET /ab-testing/:id - Render A/B testing page
router.get('/:id', abTestingController.getABTestingPage);

// POST /ab-testing/:id/create - Create test variants
router.post('/:id/create', abTestingController.createTestVariants);

// POST /ab-testing/:id/select-winner - Select winning variant
router.post('/:id/select-winner', abTestingController.selectWinningVariant);

// GET /ab-testing/:id/results - Get test results
router.get('/:id/results', abTestingController.getTestResults);

// GET /ab-testing/:id/analytics - Get variant analytics
router.get('/:id/analytics', abTestingController.getVariantAnalytics);

// Tracking routes (these don't require full auth, just website ID validation)
router.post('/:websiteId/track-visit/:variantId', abTestingController.trackVariantVisit);
router.post('/:websiteId/track-conversion/:variantId', abTestingController.trackVariantConversion);

module.exports = router;
