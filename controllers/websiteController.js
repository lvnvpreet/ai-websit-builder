// File location: controllers/websiteController.js

const Website = require('../models/Website');
const Page = require('../models/Page');

// Get all websites for the logged-in user
exports.getAllWebsites = async (req, res) => {
  try {
    console.log(`Getting all websites for user: ${req.user._id}`);
    
    // Fetch all websites for this user
    const websites = await Website.find({ user: req.user._id })
      .sort({ createdAt: -1 }); // Show newest first
    
    console.log(`Found ${websites.length} websites for user`);
    
    // Render the websites list
    res.render('websites/index', {
      title: 'My Websites',
      websites
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).render('error', {
      message: 'Error fetching websites',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Get details for a specific website
exports.getWebsiteDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the website
    const website = await Website.findOne({ _id: id, user: req.user._id });
    
    if (!website) {
      return res.status(404).render('error', { 
        message: 'Website not found',
        error: { status: 404 }
      });
    }
    
    // Find all pages for this website
    const pages = await Page.find({ website: id });
    
    // Render the website details page
    res.render('websites/details', {
      title: website.businessName,
      website,
      pages
    });
  } catch (error) {
    console.error('Error fetching website details:', error);
    res.status(500).render('error', {
      message: 'Error fetching website details',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Delete a website
exports.deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the website
    const website = await Website.findOneAndDelete({ _id: id, user: req.user._id });
    
    if (!website) {
      return res.status(404).json({ success: false, message: 'Website not found' });
    }
    
    // Delete all associated pages
    await Page.deleteMany({ website: id });
    
    // Return success
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json({ success: false, message: 'Error deleting website' });
  }
};