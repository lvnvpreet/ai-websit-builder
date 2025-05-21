// services/abTestingService.js
const Website = require('../models/Website');
const Page = require('../models/Page');
const aiService = require('./aiService');
const promptBuilder = require('./promptBuilder');
const contentProcessor = require('./contentProcessor');
const generationConfig = require('../config/generationConfig');
const themeCustomizationService = require('./themeCustomizationService');
const fs = require('fs');
const path = require('path');

/**
 * Service for managing A/B testing of website designs
 */
class ABTestingService {
  /**
   * Create A/B test variants for a website
   * @param {String} websiteId - Website ID
   * @param {Object} options - Testing options
   * @returns {Promise<Object>} Test results with variants
   */
  async createTestVariants(websiteId, options = {}) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    // Create copies of the website with different variants
    const variants = [];
    
    // Determine what to vary
    const varyColors = options.varyColors || true;
    const varyFonts = options.varyFonts || true;
    const varyLayout = options.varyLayout || true;
    
    // Get theme templates for variation
    const themes = themeCustomizationService.getThemeTemplates();
    const fontPairings = themeCustomizationService.getFontPairings();
    const layouts = themeCustomizationService.getLayoutOptions();
    
    // Create base variant (current website)
    variants.push({
      id: 'variant-original',
      name: 'Original',
      websiteId: websiteId,
      themeCustomizations: website.themeCustomizations || {
        primary: website.primaryColor,
        secondary: website.secondaryColor,
        fontHeadings: website.fontFamily,
        fontBody: website.fontFamily
      }
    });
    
    // Create color variants
    if (varyColors) {
      const themeKeys = Object.keys(themes);
      for (let i = 0; i < Math.min(2, themeKeys.length); i++) {
        const theme = themes[themeKeys[i]];
        variants.push({
          id: `variant-color-${i+1}`,
          name: `Color Variant ${i+1}`,
          websiteId: websiteId,
          themeCustomizations: {
            ...(website.themeCustomizations || {}),
            primary: theme.primary,
            secondary: theme.secondary,
            accent: theme.accent
          }
        });
      }
    }
    
    // Create font variants
    if (varyFonts) {
      for (let i = 0; i < Math.min(2, fontPairings.length); i++) {
        const fontPair = fontPairings[i];
        variants.push({
          id: `variant-font-${i+1}`,
          name: `Font Variant ${i+1}`,
          websiteId: websiteId,
          themeCustomizations: {
            ...(website.themeCustomizations || {}),
            fontHeadings: fontPair.heading,
            fontBody: fontPair.body
          }
        });
      }
    }
    
    // Create layout variants
    if (varyLayout) {
      const layoutKeys = Object.keys(layouts);
      for (let i = 0; i < Math.min(2, layoutKeys.length); i++) {
        const layoutKey = layoutKeys[i];
        variants.push({
          id: `variant-layout-${i+1}`,
          name: `Layout Variant ${i+1}`,
          websiteId: websiteId,
          themeCustomizations: {
            ...(website.themeCustomizations || {}),
            layoutType: layoutKey
          }
        });
      }
    }
    
    // Save variants to website
    website.abTestVariants = variants;
    await website.save();
    
    // Generate preview for each variant
    for (const variant of variants) {
      await this._generateVariantPreview(website, variant);
    }
    
    return variants;
  }
  
  /**
   * Generate preview for a test variant
   * @param {Object} website - Website document
   * @param {Object} variant - Variant data
   * @returns {Promise<Object>} Preview data
   */
  async _generateVariantPreview(website, variant) {
    try {
      // Create directory for variant
      const variantDir = path.join('exports', website._id.toString(), 'variants', variant.id);
      fs.mkdirSync(variantDir, { recursive: true });
      fs.mkdirSync(path.join(variantDir, 'css'), { recursive: true });
      
      // Generate custom CSS
      const customCSS = themeCustomizationService.generateCustomCSS(variant.themeCustomizations);
      fs.writeFileSync(path.join(variantDir, 'css', 'custom-theme.css'), customCSS);
      
      // Create preview HTML
      const previewHTML = this._generatePreviewHTML(website, variant, customCSS);
      fs.writeFileSync(path.join(variantDir, 'preview.html'), previewHTML);
      
      // Update variant with preview path
      variant.previewPath = `/exports/${website._id}/variants/${variant.id}/preview.html`;
      
      return variant;
    } catch (error) {
      console.error('Error generating variant preview:', error);
      return variant;
    }
  }
  
  /**
   * Generate preview HTML for a variant
   * @param {Object} website - Website document
   * @param {Object} variant - Variant data
   * @param {String} css - Custom CSS
   * @returns {String} HTML content
   */
  _generatePreviewHTML(website, variant, css) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${website.websiteTitle} - ${variant.name}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          ${css}
        </style>
      </head>
      <body>
        <div class="container mt-5">
          <div class="jumbotron">
            <h1 class="display-4">${website.websiteTitle}</h1>
            <p class="lead">${website.websiteTagline || 'A stunning website built with AI'}</p>
            <hr class="my-4">
            <p>${website.businessDescription}</p>
            <a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
            <a class="btn btn-secondary btn-lg" href="#" role="button">Contact us</a>
          </div>
          
          <div class="row mt-5">
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Feature One</h5>
                  <p class="card-text">This is a sample feature description for the ${variant.name} variant.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Feature Two</h5>
                  <p class="card-text">Another sample feature showcasing the design of this variant.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Feature Three</h5>
                  <p class="card-text">A third feature to demonstrate the styling of this variant.</p>
                </div>
              </div>
            </div>
          </div>
          
          <footer class="mt-5 p-4 text-center">
            <p>This is a preview of the ${variant.name} for ${website.businessName}.</p>
          </footer>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
      </html>
    `;
  }
  
  /**
   * Select a winning variant
   * @param {String} websiteId - Website ID
   * @param {String} variantId - Winning variant ID
   * @returns {Promise<Object>} Result
   */
  async selectWinningVariant(websiteId, variantId) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    const variant = website.abTestVariants.find(v => v.id === variantId);
    if (!variant) throw new Error('Variant not found');
    
    // Apply winning variant theme to website
    website.themeCustomizations = variant.themeCustomizations;
    
    // If we have primaryColor/secondaryColor fields still being used elsewhere, update those too
    if (variant.themeCustomizations.primary) {
      website.primaryColor = variant.themeCustomizations.primary;
    }
    if (variant.themeCustomizations.secondary) {
      website.secondaryColor = variant.themeCustomizations.secondary;
    }
    
    // Apply theme to website files
    await themeCustomizationService.applyThemeToWebsite(websiteId);
    
    await website.save();
    return { success: true, website };
  }
  
  /**
   * Get test results for a website
   * @param {String} websiteId - Website ID
   * @returns {Promise<Object>} Test results
   */
  async getTestResults(websiteId) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    return website.abTestVariants || [];
  }
}

module.exports = new ABTestingService();
