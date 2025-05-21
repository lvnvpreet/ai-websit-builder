// controllers/abTestingController.js
const Website = require('../models/Website');
const abTestingService = require('../services/abTestingService');

/**
 * Controller for A/B testing functionality
 */
const abTestingController = {
  /**
   * Render A/B testing page
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getABTestingPage: async (req, res) => {
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
          message: 'You do not have permission to access A/B testing for this website.'
        });
      }
      
      // Get test variants if they exist
      const variants = website.abTestVariants || [];
      
      res.render('websites/ab-testing', {
        website,
        variants
      });
    } catch (error) {
      console.error('Error in getABTestingPage:', error);
      res.status(500).render('error', {
        error: 'Server error',
        message: 'Failed to load A/B testing page.'
      });
    }
  },
  
  /**
   * Create test variants
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createTestVariants: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const { variantCount, variantType } = req.body;
      
      // Create variants
      const results = await abTestingService.createTestVariants(websiteId, {
        variantCount: parseInt(variantCount) || 2,
        variantType: variantType || 'design'
      });
      
      if (results.success) {
        res.json({ success: true, variants: results.variants });
      } else {
        throw new Error(results.message || 'Failed to create test variants');
      }
    } catch (error) {
      console.error('Error in createTestVariants:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to create test variants' });
    }
  },
  
  /**
   * Select a winning variant
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  selectWinningVariant: async (req, res) => {
    try {
      const websiteId = req.params.id;
      const variantId = req.body.variantId;
      
      if (!variantId) {
        return res.status(400).json({ success: false, message: 'Variant ID is required' });
      }
      
      const website = await Website.findById(websiteId);
      
      if (!website) {
        return res.status(404).json({ success: false, message: 'Website not found' });
      }
      
      // Check if user owns this website
      if (website.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      
      // Select winning variant
      const result = await abTestingService.selectWinningVariant(websiteId, variantId);
      
      res.json({ success: true, message: 'Winning variant selected successfully', result });
    } catch (error) {
      console.error('Error in selectWinningVariant:', error);
      res.status(500).json({ success: false, message: 'Failed to select winning variant' });
    }
  },
  
  /**
   * Get test results
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getTestResults: async (req, res) => {
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
      
      // Get test results
      const results = await abTestingService.getTestResults(websiteId);
      
      res.json({ success: true, results });
    } catch (error) {
      console.error('Error in getTestResults:', error);
      res.status(500).json({ success: false, message: 'Failed to get test results' });
    }
  },
  
  /**
   * Track variant visit
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  trackVariantVisit: async (req, res) => {
    try {
      const { websiteId, variantId } = req.params;
      
      // Track visit
      await abTestingService.trackVariantVisit(websiteId, variantId);
      
      // Return success (204 No Content is appropriate for tracking endpoints)
      res.status(204).end();
    } catch (error) {
      console.error('Error tracking variant visit:', error);
      // Still return success to client, even on error (to not interrupt user experience)
      res.status(204).end();
    }
  },
  
  /**
   * Track variant conversion
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  trackVariantConversion: async (req, res) => {
    try {
      const { websiteId, variantId } = req.params;
      
      // Track conversion
      await abTestingService.trackVariantConversion(websiteId, variantId);
      
      // Return success
      res.status(204).end();
    } catch (error) {
      console.error('Error tracking variant conversion:', error);
      // Still return success to client, even on error
      res.status(204).end();
    }
  },
  
  /**
   * Get variant analytics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getVariantAnalytics: async (req, res) => {
    try {
      const { websiteId } = req.params;
      
      // Get analytics data
      const analytics = await abTestingService.getVariantAnalytics(websiteId);
      
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting variant analytics:', error);
      res.status(500).json({ success: false, message: 'Failed to get variant analytics' });
    }
  }
};

module.exports = abTestingController;
