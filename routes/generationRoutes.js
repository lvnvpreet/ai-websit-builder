const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const generationController = require('../controllers/generationController');

// Render generation progress page
router.get('/generate/:id', ensureAuth, generationController.getGenerationPage);

// Start generation process
router.post('/generate/:id/start', ensureAuth, generationController.startGeneration);

// Get generation status
router.get('/generate/:id/status', ensureAuth, generationController.getGenerationStatus);

// Generation complete page
router.get('/generate/:id/complete', ensureAuth, generationController.getGenerationComplete);

module.exports = router;