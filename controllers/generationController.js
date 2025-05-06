const Website = require('../models/Website');
const Page = require('../models/Page');
const generationService = require('../services/generationService');
const ollamaService = require('../services/ollamaService');

// Render generation page
exports.getGenerationPage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the website
    const website = await Website.findOne({ _id: id, user: req.user._id });
    
    if (!website) {
      return res.status(404).send('Website not found');
    }
    
    // Check if website is already generated
    if (website.status === 'completed') {
      return res.redirect(`/websites/${website._id}/preview`);
    }
    
    // Check Ollama server status
    const isServerRunning = await ollamaService.isServerRunning();
    
    res.render('generation/progress', {
      website,
      isServerRunning
    });
  } catch (error) {
    console.error('Error loading generation page:', error);
    res.status(500).send('Error loading generation page');
  }
};

// Start generation process
exports.startGeneration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the website
    const website = await Website.findOne({ _id: id, user: req.user._id });
    
    if (!website) {
      return res.status(404).json({ success: false, message: 'Website not found' });
    }
    
    // Check if generation is already in progress
    if (website.status === 'generating') {
      return res.status(400).json({ success: false, message: 'Generation already in progress' });
    }
    
    // Update status to generating
    website.status = 'generating';
    await website.save();
    
    // Start async generation process
    // Store starting time for tracking
    req.session[`generation_start_${website._id}`] = Date.now();
    
    // Define progress callback
    const progressCallback = (progress, message) => {
      // Store progress in session for status API to access
      req.session[`generation_progress_${website._id}`] = progress;
      req.session[`generation_message_${website._id}`] = message;
      
      console.log(`[Generation ${website._id}] ${progress}% - ${message}`);
    };
    
    // Start the generation process asynchronously
    generationService.generateWebsite(website, progressCallback)
      .then(() => {
        console.log(`Website ${website._id} generation completed successfully`);
        
        // Log generation time
        const startTime = req.session[`generation_start_${website._id}`];
        const totalTime = Date.now() - startTime;
        console.log(`Generation completed in ${Math.round(totalTime / 1000)} seconds`);
        
        // Clean up session storage
        delete req.session[`generation_start_${website._id}`];
        delete req.session[`generation_progress_${website._id}`];
        delete req.session[`generation_message_${website._id}`];
        
        // Record completion in the database
        website.status = 'completed';
        website.generatedAt = new Date();
        return website.save();
      })
      .catch(async (error) => {
        console.error(`Website ${website._id} generation failed:`, error);
        
        // Record failure in the database
        website.status = 'failed';
        await website.save();
      });
    
    res.json({ success: true, message: 'Generation started' });
  } catch (error) {
    console.error('Error starting generation:', error);
    res.status(500).json({ success: false, message: 'Error starting generation' });
  }
};

// Get generation status
exports.getGenerationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the website
    const website = await Website.findOne({ _id: id, user: req.user._id });
    
    if (!website) {
      return res.status(404).json({ success: false, message: 'Website not found' });
    }
    
    // Get progress from session
    const progress = req.session[`generation_progress_${website._id}`] || 0;
    const message = req.session[`generation_message_${website._id}`] || 'Initializing';
    
    // Return current status
    res.json({
      success: true,
      status: website.status,
      progress,
      message
    });
  } catch (error) {
    console.error('Error getting generation status:', error);
    res.status(500).json({ success: false, message: 'Error getting generation status' });
  }
};

// Complete generation page
exports.getGenerationComplete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the website with populated pages
    const website = await Website.findOne({ _id: id, user: req.user._id });
    const pages = await Page.find({ website: id });
    
    if (!website) {
      return res.status(404).send('Website not found');
    }
    
    // If website is not completed, redirect to progress page
    if (website.status !== 'completed') {
      return res.redirect(`/generate/${id}`);
    }
    
    res.render('generation/complete', {
      website,
      pages
    });
  } catch (error) {
    console.error('Error loading completion page:', error);
    res.status(500).send('Error loading completion page');
  }
};