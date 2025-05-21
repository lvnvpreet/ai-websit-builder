const User = require('../models/User');
const Website = require('../models/Website');
const bcrypt = require('bcryptjs');
const { isOllamaRunning, getOllamaModels } = require('../services/ollamaService');
const aiService = require('../services/aiService');
const openRouterService = require('../services/openRouterService');

// Get profile page
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }

    // Count user's websites
    const websiteCount = await Website.countDocuments({ user: user._id });
    
    // Check if Ollama server is running
    let ollamaStatus = {
      running: false,
      models: []
    };
    
    try {
      // Only check Ollama status if that's the selected provider
      if (user.llmSettings && user.llmSettings.provider === 'ollama') {
        ollamaStatus.running = await isOllamaRunning(user.llmSettings.ollamaServerUrl);
        
        if (ollamaStatus.running) {
          ollamaStatus.models = await getOllamaModels(user.llmSettings.ollamaServerUrl);
        }
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
    }
    
    // Get user stats
    const websiteData = await getWebsiteStats(user._id);
    
    res.render('profile/index', {
      user,
      websiteCount,
      ollamaStatus,
      websiteData,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).send('Error loading profile');
  }
};

// Update profile information
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect('/profile?error=Invalid+email+format');
    }
    
    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } });
    if (existingUser) {
      return res.redirect('/profile?error=Email+already+in+use');
    }
    
    // Update user
    await User.findByIdAndUpdate(req.session.userId, { name, email });
    
    res.redirect('/profile?success=Profile+updated+successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect('/profile?error=Error+updating+profile');
  }
};

// Change password
exports.getChangePassword = (req, res) => {
  res.render('profile/change-password', {
    success: req.query.success,
    error: req.query.error
  });
};

// Process password change
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    // Validate current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.redirect('/profile/change-password?error=Current+password+is+incorrect');
    }
    
    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.redirect('/profile/change-password?error=New+passwords+do+not+match');
    }
    
    if (newPassword.length < 6) {
      return res.redirect('/profile/change-password?error=New+password+must+be+at+least+6+characters');
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.redirect('/profile/change-password?success=Password+changed+successfully');
  } catch (error) {
    console.error('Error changing password:', error);
    res.redirect('/profile/change-password?error=Error+changing+password');
  }
};

// AI Provider settings
exports.getAiSettings = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    // Check Ollama status
    let ollamaStatus = {
      running: false,
      models: []
    };
      // Check OpenRouter status
    let openRouterStatus = {
      running: false,
      models: [],
      quotaStatus: null
    };
    
    try {
      // Check Ollama status if that's the configured provider or none is set
      if (!user.llmSettings?.provider || user.llmSettings.provider === 'ollama') {
        ollamaStatus.running = await isOllamaRunning(
          user.llmSettings?.ollamaServerUrl || 'http://localhost:11434'
        );
        
        if (ollamaStatus.running) {
          ollamaStatus.models = await getOllamaModels(
            user.llmSettings?.ollamaServerUrl || 'http://localhost:11434'
          );
        }
      }
        // Check OpenRouter status if that's the configured provider
      if (user.llmSettings?.provider === 'openrouter' && user.llmSettings?.openRouterApiKey) {
        // Set the API key before checking status
        openRouterService.apiKey = user.llmSettings.openRouterApiKey;
        openRouterStatus.running = await openRouterService.isServerRunning();
        
        if (openRouterStatus.running) {
          openRouterStatus.models = await openRouterService.getAvailableModels();
          openRouterStatus.quotaStatus = openRouterService.getQuotaStatus();
        }
      }
      
    } catch (error) {
      console.error('Error checking AI services status:', error);
    }
    
    res.render('profile/ai-settings', {
      user,
      ollamaStatus,
      openRouterStatus,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error loading AI settings:', error);
    res.status(500).send('Error loading AI settings');
  }
};

// Update AI Provider settings
exports.updateAiSettings = async (req, res) => {
  try {
    const { provider, openaiApiKey, ollamaServerUrl, ollamaModelName, anthropicApiKey, openRouterApiKey, openRouterModelName } = req.body;
    
    // Validate provider
    if (!['openai', 'ollama', 'anthropic', 'openrouter'].includes(provider)) {
      return res.redirect('/profile/ai-settings?error=Invalid+provider');
    }
    
    // Create llmSettings object
    const llmSettings = {
      provider,
      ollamaServerUrl: ollamaServerUrl || 'http://localhost:11434',
      ollamaModelName: ollamaModelName || 'llama2',
      anthropicApiKey: anthropicApiKey || '',
      openRouterApiKey: openRouterApiKey || '',
      openRouterModelName: openRouterModelName || 'gpt-3.5-turbo'
    };
      // Update user
    const updateData = { llmSettings };
    
    // Only update API keys if provided (not empty)
    if (provider === 'openai' && openaiApiKey && openaiApiKey.trim() !== '') {
      updateData.openaiApiKey = openaiApiKey;
    }
    
    if (provider === 'openrouter' && openRouterApiKey && openRouterApiKey.trim() !== '') {
      // Save to user data
      llmSettings.openRouterApiKey = openRouterApiKey;
      
      // Set in OpenRouter service
      process.env.OPENROUTER_API_KEY = openRouterApiKey;
      
      // If OpenRouter is selected, set it as the active provider in AIService
      if (provider === 'openrouter') {
        aiService.setProvider('openrouter');
        if (openRouterModelName) {
          openRouterService.setModel(openRouterModelName);
        }
      }
    }
    
    // Set the AI provider in our AIService
    if (['ollama', 'openrouter'].includes(provider)) {
      aiService.setProvider(provider);
    }
    
    await User.findByIdAndUpdate(req.session.userId, updateData);
    
    res.redirect('/profile/ai-settings?success=AI+settings+updated+successfully');
  } catch (error) {
    console.error('Error updating AI settings:', error);
    res.redirect('/profile/ai-settings?error=Error+updating+AI+settings');
  }
};

// Get user's websites statistics
async function getWebsiteStats(userId) {
  try {
    // Get all websites
    const websites = await Website.find({ user: userId });
    
    // Get page counts for each website
    const websiteData = [];
    
    for (const website of websites) {
      const pageCount = website.pages ? website.pages.length : 0;
      const generationStatus = website.status || 'pending';
      const generatedDate = website.generatedAt ? new Date(website.generatedAt).toLocaleDateString() : 'N/A';
      
      websiteData.push({
        id: website._id,
        name: website.businessName || website.name,
        pageCount,
        status: generationStatus,
        generatedDate
      });
    }
    
    return websiteData;
  } catch (error) {
    console.error('Error getting website stats:', error);
    return [];
  }
}