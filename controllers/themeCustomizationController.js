// controllers/themeCustomizationController.js
const Website = require('../models/Website');
const themeCustomizationService = require('../services/themeCustomizationService');

/**
 * Controller for theme customization functionality
 */
const themeCustomizationController = {
  /**
   * Render theme customization page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getThemeCustomizer: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const website = await Website.findById(websiteId);
      
      if (!website) {
        return res.status(404).render('error', {
          error: 'Website not found',
          message: 'The requested website does not exist.'
        });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).render('error', {
          error: 'Access denied',
          message: 'You do not have permission to customize this website.'
        });
      }
      
      // Get theme templates and options
      const themeTemplates = themeCustomizationService.getThemeTemplates();
      const fontPairings = themeCustomizationService.getFontPairings();
      const layoutOptions = themeCustomizationService.getLayoutOptions();
      
      res.render('websites/theme-customizer', {
        website,
        themeTemplates,
        fontPairings,
        layoutOptions
      });
    } catch (error) {
      console.error('Error in getThemeCustomizer:', error);
      res.status(500).render('error', {
        error: 'Server error',
        message: 'Failed to load theme customizer.'
      });
    }
  },
  
  /**
   * Save theme customizations
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  saveThemeCustomizations: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const website = await Website.findById(websiteId);
      
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Save theme customizations
      const customizations = req.body.themeCustomizations;
      await themeCustomizationService.saveThemeCustomizations(websiteId, customizations);
      
      // If we're also saving the legacy color fields, update those too
      if (req.body.primaryColor) {
        website.primaryColor = req.body.primaryColor;
      }
      if (req.body.secondaryColor) {
        website.secondaryColor = req.body.secondaryColor;
      }
      if (req.body.fontFamily) {
        website.fontFamily = req.body.fontFamily;
      }
      
      await website.save();
      
      res.json({ success: true, message: 'Theme customizations saved successfully' });
    } catch (error) {
      console.error('Error in saveThemeCustomizations:', error);
      res.status(500).json({ success: false, message: 'Failed to save theme customizations' });
    }
  },
  
  /**
   * Apply theme customizations to website
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  applyThemeToWebsite: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const website = await Website.findById(websiteId);
      
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Apply theme to website
      const result = await themeCustomizationService.applyThemeToWebsite(websiteId);
      
      res.json({ success: true, message: 'Theme applied successfully', result });
    } catch (error) {
      console.error('Error in applyThemeToWebsite:', error);
      res.status(500).json({ success: false, message: 'Failed to apply theme to website' });
    }
  },
  
  /**
   * Preview theme in real-time
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  previewTheme: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const themeData = req.body;
      
      // Validate the website exists
      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Generate CSS based on theme data
      const css = themeCustomizationService.generateThemeCSS(themeData);
      
      res.json({ 
        success: true, 
        css: css 
      });
    } catch (error) {
      console.error('Error in previewTheme:', error);
      res.status(500).json({ success: false, message: 'Failed to generate theme preview' });
    }
  }
};

module.exports = themeCustomizationController;
