// controllers/partialRegenerationController.js
const Website = require('../models/Website');
const Page = require('../models/Page');
const partialRegenerationService = require('../services/partialRegenerationService');

/**
 * Controller for partial regeneration functionality
 */
const partialRegenerationController = {
  /**
   * Render page editor
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getPageEditor: async (req, res) => {
    try {
      const websiteId = req.params.websiteId;
      const pageId = req.params.pageId;
      
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
          message: 'You do not have permission to edit this website.'
        });
      }
      
      const page = await Page.findOne({ _id: pageId, website: websiteId });
      if (!page) {
        return res.status(404).render('error', {
          error: 'Page not found',
          message: 'The requested page does not exist.'
        });
      }
      
      res.render('websites/page-editor', {
        website,
        page
      });
    } catch (error) {
      console.error('Error in getPageEditor:', error);
      res.status(500).render('error', {
        error: 'Server error',
        message: 'Failed to load page editor.'
      });
    }
  },
  
  /**
   * Regenerate section
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  regenerateSection: async (req, res) => {
    try {
      const websiteId = req.params.websiteId;
      const pageId = req.params.pageId;
      const sectionReference = req.params.sectionId;
      
      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Get options from request
      const options = {
        customInstructions: req.body.customInstructions || ''
      };
      
      // Regenerate section
      const section = await partialRegenerationService.regenerateSection(
        websiteId,
        pageId,
        sectionReference,
        options
      );
      
      res.json({ success: true, message: 'Section regenerated successfully', section });
    } catch (error) {
      console.error('Error in regenerateSection:', error);
      res.status(500).json({ success: false, message: 'Failed to regenerate section' });
    }
  },
  
  /**
   * Regenerate page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  regeneratePage: async (req, res) => {
    try {
      const websiteId = req.params.websiteId;
      const pageId = req.params.pageId;
      
      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Get options from request
      const options = {
        customInstructions: req.body.customInstructions || ''
      };
      
      // Regenerate page
      const page = await partialRegenerationService.regeneratePage(
        websiteId,
        pageId,
        options
      );
      
      res.json({ success: true, message: 'Page regenerated successfully', page });
    } catch (error) {
      console.error('Error in regeneratePage:', error);
      res.status(500).json({ success: false, message: 'Failed to regenerate page' });
    }
  },
  
  /**
   * Add new section
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  addNewSection: async (req, res) => {
    try {
      const websiteId = req.params.websiteId;
      const pageId = req.params.pageId;
      
      const website = await Website.findById(websiteId);
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Validate section type
      const sectionType = req.body.sectionType;
      if (!sectionType) {
        return res.status(400).json({ success: false, message: 'Section type is required' });
      }
      
      // Get options from request
      const options = {
        customInstructions: req.body.customInstructions || ''
      };
      
      // Generate new section
      const section = await partialRegenerationService.generateNewSection(
        websiteId,
        pageId,
        sectionType,
        options
      );
      
      res.json({ success: true, message: 'Section added successfully', section });
    } catch (error) {
      console.error('Error in addNewSection:', error);
      res.status(500).json({ success: false, message: 'Failed to add new section' });
    }
  }
};

module.exports = partialRegenerationController;
