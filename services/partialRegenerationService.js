// services/partialRegenerationService.js
const Website = require('../models/Website');
const Page = require('../models/Page');
const aiService = require('./aiService');
const promptBuilder = require('./promptBuilder');
const contentProcessor = require('./contentProcessor');
const generationConfig = require('../config/generationConfig');
const fs = require('fs');
const path = require('path');

/**
 * Service for managing partial regeneration of website content
 */
class PartialRegenerationService {
  /**
   * Regenerate a specific section of a page
   * @param {String} websiteId - Website ID
   * @param {String} pageId - Page ID
   * @param {String} sectionReference - Section reference ID
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Regenerated section
   */
  async regenerateSection(websiteId, pageId, sectionReference, options = {}) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    const page = await Page.findOne({ _id: pageId, website: websiteId });
    if (!page) throw new Error('Page not found');
    
    const section = page.sections.find(s => s.sectionReference === sectionReference);
    if (!section) throw new Error('Section not found');
      // Prepare data
    const websiteData = this._prepareWebsiteData(website);
    const pageData = {
      name: page.name,
      slug: page.slug,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription
    };
    
    // Build prompt for section regeneration
    const sectionPrompt = promptBuilder.buildSectionPrompt(
      websiteData,
      pageData,
      section.type || 'default',
      options.customInstructions || '',
      true
    );
    
    // Generate new section content
    const response = await aiService.generateText(
      sectionPrompt,
      generationConfig.generation.jsonParams
    );
    
    // Process content
    const processed = contentProcessor.processSectionContent(response);
    
    if (!processed || !processed.content) {
      throw new Error('Failed to generate section content');
    }
    
    // Update section
    section.content = processed.content;
    if (processed.css) {
      section.css = processed.css;
    }
    
    // Save page with updated section
    await page.save();
    
    // Update exported files if they exist
    this._updateExportedFiles(website._id, page, section);
    
    return section;
  }
  
  /**
   * Regenerate an entire page
   * @param {String} websiteId - Website ID
   * @param {String} pageId - Page ID
   * @param {Object} options - Additional options 
   * @returns {Promise<Object>} Regenerated page
   */
  async regeneratePage(websiteId, pageId, options = {}) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    const page = await Page.findOne({ _id: pageId, website: websiteId });
    if (!page) throw new Error('Page not found');
    
    // Prepare data
    const websiteData = this._prepareWebsiteData(website);
    const pageData = {
      name: page.name,
      slug: page.slug,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription
    };
      // Build prompt for page regeneration
    const pagePrompt = promptBuilder.buildPagePrompt(
      websiteData, 
      pageData,
      options.customInstructions || ''
    );
    
    // Generate new page content
    const response = await aiService.generateText(
      pagePrompt,
      generationConfig.generation.jsonParams
    );
    
    // Process content
    const processed = contentProcessor.processPageContent(response);
    
    if (!processed || !processed.sections || processed.sections.length === 0) {
      throw new Error('Failed to generate page content');
    }
    
    // Update page sections
    page.sections = processed.sections.map(section => ({
      sectionReference: section.sectionReference || this._generateSectionReference(),
      content: section.content,
      css: section.css,
      type: section.type
    }));
    
    // Save updated page
    await page.save();
    
    // Update exported files if they exist
    this._updateExportedPageFiles(website._id, page);
    
    return page;
  }
  
  /**
   * Generate a new section for a page
   * @param {String} websiteId - Website ID
   * @param {String} pageId - Page ID
   * @param {String} sectionType - Type of section to generate
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} New section
   */
  async generateNewSection(websiteId, pageId, sectionType, options = {}) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    const page = await Page.findOne({ _id: pageId, website: websiteId });
    if (!page) throw new Error('Page not found');
    
    // Prepare data
    const websiteData = this._prepareWebsiteData(website);
    const pageData = {
      name: page.name,
      slug: page.slug,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription
    };
      // Build prompt for section generation
    const sectionPrompt = promptBuilder.buildSectionPrompt(
      websiteData,
      pageData,
      sectionType,
      options.customInstructions || '',
      false
    );
    
    // Generate new section content
    const response = await aiService.generateText(
      sectionPrompt,
      generationConfig.generation.jsonParams
    );
    
    // Process content
    const processed = contentProcessor.processSectionContent(response);
    
    if (!processed || !processed.content) {
      throw new Error('Failed to generate section content');
    }
    
    // Create new section
    const newSection = {
      sectionReference: this._generateSectionReference(),
      content: processed.content,
      css: processed.css,
      type: sectionType
    };
    
    // Add section to page
    page.sections.push(newSection);
    
    // Save page with new section
    await page.save();
    
    // Update exported files if they exist
    this._updateExportedFiles(website._id, page, newSection);
    
    return newSection;
  }
  
  /**
   * Prepare website data for prompt creation
   * @param {Object} website - Website document
   * @returns {Object} Prepared data
   */
  _prepareWebsiteData(website) {
    return {
      businessName: website.businessName,
      businessCategory: website.businessCategory,
      businessDescription: website.businessDescription,
      websiteTitle: website.websiteTitle,
      websiteTagline: website.websiteTagline,
      websiteType: website.websiteType,
      websitePurpose: website.websitePurpose,
      primaryColor: website.primaryColor,
      secondaryColor: website.secondaryColor,
      fontFamily: website.fontFamily,
      fontStyle: website.fontStyle,
      pages: website.pages,
      hasNewsletter: website.hasNewsletter,
      hasGoogleMap: website.hasGoogleMap,
      hasImageSlider: website.hasImageSlider,
      address: website.address,
      email: website.email,
      phone: website.phone,
      socialLinks: website.socialLinks
    };
  }
  
  /**
   * Generate a unique section reference
   * @returns {String} Section reference ID
   */
  _generateSectionReference() {
    return `section_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }
  
  /**
   * Update exported files with new section
   * @param {String} websiteId - Website ID
   * @param {Object} page - Page document
   * @param {Object} section - Section object
   */
  _updateExportedFiles(websiteId, page, section) {
    try {
      const exportDir = path.join('exports', websiteId.toString());
      
      // Check if export directory exists
      if (!fs.existsSync(exportDir)) {
        return; // Website hasn't been exported yet
      }
      
      const pageFile = path.join(exportDir, `${page.slug}.html`);
      
      // Check if page file exists
      if (!fs.existsSync(pageFile)) {
        return; // Page file doesn't exist
      }
      
      // Read page file
      let pageContent = fs.readFileSync(pageFile, 'utf8');
      
      // Find section in file
      const sectionRegex = new RegExp(`<div[^>]*data-section="${section.sectionReference}"[^>]*>.*?</div>\\s*<!-- End section ${section.sectionReference} -->`, 's');
      const sectionMatch = pageContent.match(sectionRegex);
      
      if (sectionMatch) {
        // Replace section content
        pageContent = pageContent.replace(
          sectionRegex,
          `<div class="section" data-section="${section.sectionReference}">${section.content}</div><!-- End section ${section.sectionReference} -->`
        );
      } else {
        // Section doesn't exist, add it to the main content area
        const contentRegex = /<main[^>]*>(.*?)<\/main>/s;
        const contentMatch = pageContent.match(contentRegex);
        
        if (contentMatch) {
          const newContent = `${contentMatch[1]}\n<div class="section" data-section="${section.sectionReference}">${section.content}</div><!-- End section ${section.sectionReference} -->`;
          pageContent = pageContent.replace(contentRegex, `<main>$${newContent}</main>`);
        }
      }
      
      // Write updated page file
      fs.writeFileSync(pageFile, pageContent, 'utf8');
      
      // Update CSS if needed
      if (section.css) {
        const cssDir = path.join(exportDir, 'css');
        const cssFile = path.join(cssDir, `${page.slug}.css`);
        
        let cssContent = '';
        if (fs.existsSync(cssFile)) {
          cssContent = fs.readFileSync(cssFile, 'utf8');
        }
        
        // Add section CSS
        cssContent += `\n/* Section ${section.sectionReference} styles */\n${section.css}\n`;
        
        // Ensure CSS directory exists
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        
        // Write CSS file
        fs.writeFileSync(cssFile, cssContent, 'utf8');
      }
      
    } catch (error) {
      console.error('Error updating exported files:', error);
    }
  }
  
  /**
   * Update exported page files
   * @param {String} websiteId - Website ID 
   * @param {Object} page - Page document
   */
  _updateExportedPageFiles(websiteId, page) {
    try {
      const exportDir = path.join('exports', websiteId.toString());
      
      // Check if export directory exists
      if (!fs.existsSync(exportDir)) {
        return; // Website hasn't been exported yet
      }
      
      const pageFile = path.join(exportDir, `${page.slug}.html`);
      
      // Generate page HTML
      let pageHTML = this._generatePageHTML(page);
      
      // Write page file
      fs.writeFileSync(pageFile, pageHTML, 'utf8');
      
      // Generate CSS
      let cssContent = '';
      for (const section of page.sections) {
        if (section.css) {
          cssContent += `\n/* Section ${section.sectionReference} styles */\n${section.css}\n`;
        }
      }
      
      // Write CSS file if we have content
      if (cssContent.trim()) {
        const cssDir = path.join(exportDir, 'css');
        if (!fs.existsSync(cssDir)) {
          fs.mkdirSync(cssDir, { recursive: true });
        }
        
        const cssFile = path.join(cssDir, `${page.slug}.css`);
        fs.writeFileSync(cssFile, cssContent, 'utf8');
      }
      
    } catch (error) {
      console.error('Error updating exported page files:', error);
    }
  }
  
  /**
   * Generate HTML for a page
   * @param {Object} page - Page document
   * @returns {String} HTML content
   */
  _generatePageHTML(page) {
    // This is a simplified version - in production this would use the same
    // HTML generation logic as your export service
    
    let sectionsContent = '';
    for (const section of page.sections) {
      sectionsContent += `<div class="section" data-section="${section.sectionReference}">${section.content}</div><!-- End section ${section.sectionReference} -->\n`;
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${page.seoTitle || page.name}</title>
        <meta name="description" content="${page.seoDescription || ''}">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="/css/${page.slug}.css">
        <link rel="stylesheet" href="/css/custom-theme.css">
      </head>
      <body>
        <header>
          <!-- Header content here -->
        </header>
        
        <main>
          ${sectionsContent}
        </main>
        
        <footer>
          <!-- Footer content here -->
        </footer>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
      </body>
      </html>
    `;
  }
}

module.exports = new PartialRegenerationService();
