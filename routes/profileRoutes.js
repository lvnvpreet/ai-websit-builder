const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Main profile page
router.get('/profile', ensureAuth, profileController.getProfile);
router.post('/profile', ensureAuth, profileController.updateProfile);

// Password change
router.get('/profile/change-password', ensureAuth, profileController.getChangePassword);
router.post('/profile/change-password', ensureAuth, profileController.updatePassword);

// AI Provider settings
router.get('/profile/ai-settings', ensureAuth, profileController.getAiSettings);
router.post('/profile/ai-settings', ensureAuth, profileController.updateAiSettings);

// API endpoint to check Ollama status
router.post('/api/ollama/check-status', ensureAuth, async (req, res) => {
  try {
    const { serverUrl } = req.body;
    const { isOllamaRunning, getOllamaModels } = require('../services/ollamaService');
    
    const isRunning = await isOllamaRunning(serverUrl);
    let models = [];
    
    if (isRunning) {
      models = await getOllamaModels(serverUrl);
    }
    
    res.json({
      success: true,
      isRunning,
      models
    });
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking Ollama status'
    });
  }
});

module.exports = router;