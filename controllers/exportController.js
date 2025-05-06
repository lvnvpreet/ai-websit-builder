const Website = require('../models/Website');
const Page = require('../models/Page');
const exportService = require('../services/exportService');

// Show export options page
exports.getExportOptions = async (req, res) => {
  try {
    // If a specific website ID is provided, show options for that website
    if (req.params.id) {
      const website = await Website.findOne({ _id: req.params.id, user: req.user._id });
      if (!website) {
        return res.status(404).send('Website not found');
      }
      
      return res.render('export/options', {
        website,
        title: `Export: ${website.businessName}`
      });
    }
    
    // Otherwise, show all websites that can be exported
    const websites = await Website.find({ 
      user: req.user._id,
      status: 'completed'
    });
    
    res.render('export/index', {
      websites,
      title: 'Export Website'
    });
  } catch (error) {
    console.error('Error loading export page:', error);
    res.status(500).send('Error loading export page');
  }
};

// Export a website
exports.exportWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { format } = req.body;
    
    // Validate export format
    const validFormats = ['html', 'static', 'development'];
    if (format && !validFormats.includes(format)) {
      return res.status(400).send('Invalid export format');
    }
    
    // Default to static format
    const exportFormat = format || 'static';
    
    // Find the website
    const website = await Website.findOne({ _id: id, user: req.user._id });
    if (!website) {
      return res.status(404).send('Website not found');
    }
    
    // Get all pages for this website
    const pages = await Page.find({ website: id });
    
    // Generate export file
    const exportFile = await exportService.generateExport(website, pages, exportFormat);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${website.businessName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${exportFormat}.zip"`);
    
    // Send the file
    res.send(exportFile);
  } catch (error) {
    console.error('Error exporting website:', error);
    res.status(500).send('Error exporting website');
  }
};