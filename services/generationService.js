const ollamaService = require('./ollamaService');
const promptBuilder = require('./promptBuilder');
const contentProcessor = require('./contentProcessor');
const generationConfig = require('../config/generationConfig');
const Website = require('../models/Website');
const Page = require('../models/Page');

const imageSearchService = require('./imageSearchService');


/**
 * Service for coordinating the website generation pipeline
 */
class GenerationService {
  /**
   * Generate a complete website based on the provided data
   * @param {Object} website - Website document from database
   * @param {Function} progressCallback - Callback to report progress
   * @returns {Promise<Object>} Generation result
   */
  async generateWebsite(website, progressCallback) {
    try {
      console.log("Starting website generation for:", website._id);
      // Update progress
      if (progressCallback) {
        progressCallback(5, 'Starting website generation');
      }

      // Prepare website data for prompt creation
      const websiteData = this._prepareWebsiteData(website);

      // Initialize result object
      const result = {
        header: null,
        footer: null,
        pages: []
      };

      // 1. Generate header
      if (progressCallback) {
        progressCallback(10, 'Generating header');
      }

      result.header = await this._generateWithRetry(
        async () => {
          const headerPrompt = promptBuilder.buildHeaderPrompt(websiteData);
          const response = await ollamaService.generateText(
            headerPrompt,
            generationConfig.generation.jsonParams
          );
          const headc = contentProcessor.processJsonContent(response)
          console.log(headc)
          return contentProcessor.processJsonContent(response);
        },
        generationConfig.generation.retry.attempts
      );

      // 2. Generate footer
      if (progressCallback) {
        progressCallback(20, 'Generating footer');
      }

      result.footer = await this._generateWithRetry(
        async () => {
          const footerPrompt = promptBuilder.buildFooterPrompt(websiteData);
          const response = await ollamaService.generateText(
            footerPrompt,
            generationConfig.generation.jsonParams
          );
          const footc = contentProcessor.processJsonContent(response)
          console.log(footc)
          return contentProcessor.processJsonContent(response);
        },
        generationConfig.generation.retry.attempts
      );

      // Use fallback templates if generation failed
      if (!result.header || !result.header.content) {
        console.warn('Header generation failed. Using fallback template.');
        result.header = this._createFallbackHeader(websiteData);
      }

      if (!result.footer || !result.footer.content) {
        console.warn('Footer generation failed. Using fallback template.');
        result.footer = this._createFallbackFooter(websiteData);
      }

      // 3. Generate pages
      const pageCount = websiteData.pages.length;
      for (let i = 0; i < pageCount; i++) {
        const pageName = websiteData.pages[i];

        // Calculate progress percentage for this page
        const startProgress = 20 + (i * (70 / pageCount));
        const endProgress = 20 + ((i + 1) * (70 / pageCount));

        if (progressCallback) {
          progressCallback(startProgress, `Generating ${pageName} page`);
        }

        // Generate page content
        const pageContent = await this._generatePage(pageName, websiteData);

        result.pages.push({
          name: pageName,
          slug: pageName.toLowerCase() === 'home' ? '/' : pageName.toLowerCase().replace(/\s+/g, '-'),
          content: pageContent
        });

        if (progressCallback) {
          progressCallback(endProgress, `Completed ${pageName} page`);
        }
      }

      // 4. Save to database
      if (progressCallback) {
        progressCallback(90, 'Saving website content');
      }

      await this._saveToDatabase(website, result);

      // Complete generation
      if (progressCallback) {
        progressCallback(100, 'Website generation complete');
      }

      return result;
    } catch (error) {
      console.error('Detailed error in generateWebsite:', error);
      console.error('Error generating website:', error);
      throw error;
    }
  }


  /**
 * Generate a specific page with sections
 * @param {string} pageName - Name of the page to generate
 * @param {Object} websiteData - Prepared website data
 * @returns {Promise<Array>} Array of page sections
 * @private
 */
  async _generatePage(pageName, websiteData) {
    try {
      console.log(`Generating ${pageName} page content`);

      // Get the page prompt
      const pagePrompt = promptBuilder.buildPagePrompt(pageName, websiteData);

      // Generate page content
      const pageContent = await this._generateWithRetry(
        async () => {
          const response = await ollamaService.generateText(
            pagePrompt,
            generationConfig.generation.jsonParams
          );
          return contentProcessor.processJsonContent(response);
        },
        generationConfig.generation.retry.attempts
      );

      // Check if we have valid sections
      if (pageContent && pageContent.sections && Array.isArray(pageContent.sections)) {
        // For each section, find suitable locations to add images
        const enhancedSections = [];

        for (let i = 0; i < pageContent.sections.length; i++) {
          const section = pageContent.sections[i];
          const sectionType = this._determineSectionType(section, i, pageName);

          // Only add images to certain section types and limit to 2 images per page
          if ((sectionType === 'hero' || sectionType === 'about') && enhancedSections.length < 2) {
            try {
              // Create a search query for this section
              const searchQuery = imageSearchService.getSearchQuery(
                pageName,
                sectionType,
                websiteData
              );

              // Search for an image
              const searchResult = await imageSearchService.searchImages(searchQuery);

              if (searchResult.success) {
                // Store original section
                const enhancedSection = { ...section };

                // Add image and attribution to the section content
                enhancedSection.content = this._insertImageIntoContent(
                  section.content,
                  searchResult.selectedImage,
                  sectionType
                );

                // Add image metadata for database storage
                enhancedSection.images = [{
                  path: searchResult.selectedImage.path,
                  alt: searchResult.selectedImage.title,
                  width: searchResult.selectedImage.width,
                  height: searchResult.selectedImage.height,
                  sourceUrl: searchResult.selectedImage.sourceUrl,
                  sourceDomain: searchResult.selectedImage.sourceDomain,
                  text: searchResult.selectedImage.attribution.text,
                  html: searchResult.selectedImage.attribution.html,
                  license: searchResult.selectedImage.attribution.license,
                  creator: searchResult.selectedImage.attribution.creator
                }];

                enhancedSections.push(enhancedSection);
                continue;
              }
            } catch (imageError) {
              console.error(`Error adding image to ${pageName} section ${i}:`, imageError);
            }
          }

          // If we couldn't add an image or didn't try, add the original section
          enhancedSections.push(section);
        }

        return enhancedSections;
      }

      // If generation failed, use fallback sections
      console.warn(`Page generation failed for ${pageName}. Using fallback sections.`);
      return this._createFallbackSections(pageName, websiteData);
    } catch (error) {
      console.error(`Error generating page ${pageName}:`, error);
      return this._createFallbackSections(pageName, websiteData);
    }
  }

  /**
   * Determine section type based on content and position
   * @param {Object} section - Section object
   * @param {number} index - Section index
   * @param {string} pageName - Page name
   * @returns {string} Section type
   * @private
   */
  _determineSectionType(section, index, pageName) {
    // Check section reference
    const reference = section.sectionReference?.toLowerCase() || '';

    if (reference.includes('hero') || index === 0) {
      return 'hero';
    } else if (reference.includes('about') || pageName.toLowerCase() === 'about') {
      return 'about';
    } else if (reference.includes('team')) {
      return 'team';
    } else if (reference.includes('service')) {
      return 'services';
    } else if (reference.includes('contact')) {
      return 'contact';
    } else if (reference.includes('gallery')) {
      return 'gallery';
    }

    // Default for unknown sections
    return 'general';
  }

  /**
   * Insert image and attribution into section content
   * @param {string} content - Section HTML content
   * @param {Object} image - Image object
   * @param {string} sectionType - Section type
   * @returns {string} Updated HTML content
   * @private
   */
  _insertImageIntoContent(content, image, sectionType) {
    // Create image HTML with attribution
    const imageHtml = `
  <div class="image-container mb-4">
    <img src="${image.path}" alt="${image.title}" class="img-fluid rounded" width="${image.width}" height="${image.height}">
    <div class="image-attribution" style="font-size: 12px; color: #666; text-align: right; margin-top: 5px; font-style: italic;">
      ${image.attribution.html}
    </div>
  </div>`;

    // Find the best place to insert the image based on section type
    if (sectionType === 'hero') {
      // For hero sections, try to insert after heading
      const headingRegex = /(<h1[^>]*>.*?<\/h1>|<h2[^>]*>.*?<\/h2>)/i;
      if (headingRegex.test(content)) {
        return content.replace(headingRegex, '$1' + imageHtml);
      }

      // If no heading, try to insert at start of container
      const containerRegex = /(<div[^>]*class="[^"]*container[^"]*"[^>]*>)/i;
      if (containerRegex.test(content)) {
        return content.replace(containerRegex, '$1' + imageHtml);
      }
    } else if (sectionType === 'about' || sectionType === 'team') {
      // For about sections, try to insert alongside text in a row
      const rowRegex = /(<div[^>]*class="[^"]*row[^"]*"[^>]*>)/i;
      if (rowRegex.test(content)) {
        // Insert as a column in existing row
        return content.replace(
          rowRegex,
          '$1<div class="col-md-6">' + imageHtml + '</div><div class="col-md-6">'
        ).replace(
          /(<\/div>\s*<\/div>\s*<\/div>)(?!.*<\/div>\s*<\/div>\s*<\/div>)/s,
          '</div></div></div>'
        );
      }
    }

    // Default: insert at the beginning
    return imageHtml + content;
  }

  /**
   * Save generated content to the database
   * @param {Object} websiteDoc - Website document from database
   * @param {Object} result - Generated website content
   * @returns {Promise<void>}
   * @private
   */
  async _saveToDatabase(websiteDoc, result) {
    try {
      // 1. Update website with header and footer
      websiteDoc.header = {
        content: result.header.content || '',
        css: result.header.css || ''
      };
      websiteDoc.footer = {
        content: result.footer.content || '',
        css: result.footer.css || ''
      };
      websiteDoc.status = 'completed';
      websiteDoc.generatedAt = new Date();

      await websiteDoc.save();

      // 2. Create or update pages
      for (const pageData of result.pages) {
        // Check if the page already exists
        let page = await Page.findOne({
          website: websiteDoc._id,
          slug: pageData.slug
        });

        if (!page) {
          // Create new page if it doesn't exist
          page = new Page({
            website: websiteDoc._id,
            name: pageData.name,
            slug: pageData.slug,
            seoTitle: pageData.name === 'Home' ? websiteDoc.websiteTitle : `${pageData.name} - ${websiteDoc.businessName}`,
            seoDescription: websiteDoc.businessDescription,
            sections: []
          });
        } else {
          // Clear existing sections if page exists
          page.sections = [];
        }

        // Add sections to page
        for (const sectionData of pageData.content) {
          page.sections.push({
            sectionReference: sectionData.sectionReference,
            content: sectionData.content,
            css: sectionData.css
          });
        }

        await page.save();
      }
    } catch (error) {
      console.error('Error saving website content to database:', error);
      console.error('Detailed error in generateWebsite:', error);
      throw error;
    }
  }

  /**
   * Prepare website data for use in prompts
   * @param {Object} website - Website document from database
   * @returns {Object} Prepared website data
   * @private
   */
  _prepareWebsiteData(website) {
    // Extract default pages based on the website's structure
    const defaultPages = ['Home', 'About', 'Services', 'Contact'];

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
      structure: website.structure,
      pages: Array.isArray(website.pages) && website.pages.length > 0
        ? website.pages
        : defaultPages,
      address: website.address,
      email: website.email,
      phone: website.phone,
      socialLinks: website.socialLinks || {},
      hasNewsletter: website.hasNewsletter,
      hasGoogleMap: website.hasGoogleMap,
      googleMapUrl: website.googleMapUrl,
      hasImageSlider: website.hasImageSlider
    };
  }

  /**
   * Create fallback header for when generation fails
   * @param {Object} websiteData - Prepared website data
   * @returns {Object} Fallback header object
   * @private
   */
  _createFallbackHeader(websiteData) {
    let headerContent = generationConfig.templates.fallbackHTML.header;

    // Replace placeholders with actual data
    headerContent = headerContent.replace(/{{businessName}}/g, websiteData.businessName);

    // Add navigation links based on pages
    if (Array.isArray(websiteData.pages) && websiteData.pages.length > 0) {
      let navLinks = '';
      websiteData.pages.forEach((page, index) => {
        const isActive = page.toLowerCase() === 'home';
        const href = page.toLowerCase() === 'home' ? '/' : `/${page.toLowerCase().replace(/\s+/g, '-')}`;
        navLinks += `<li class="nav-item"><a class="nav-link${isActive ? ' active' : ''}" href="${href}">${page}</a></li>`;
      });

      headerContent = headerContent.replace(/<ul class="navbar-nav ms-auto">[\s\S]*?<\/ul>/g,
        `<ul class="navbar-nav ms-auto">${navLinks}</ul>`);
    }

    // Create enhanced CSS
    const headerCss = `
      /* Header Styles */
      header.navbar {
        background-color: ${websiteData.primaryColor};
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        padding: 15px 0;
        transition: all 0.3s ease;
      }
      
      header .navbar-brand {
        color: white;
        font-weight: 700;
        font-size: 1.5rem;
        letter-spacing: -0.5px;
        transition: all 0.3s ease;
      }
      
      header .navbar-brand:hover {
        transform: translateY(-2px);
      }
      
      header .nav-link {
        color: rgba(255, 255, 255, 0.85) !important;
        font-weight: 500;
        padding: 8px 16px !important;
        transition: all 0.3s ease;
        position: relative;
      }
      
      header .nav-link:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background-color: white;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }
      
      header .nav-link:hover:after,
      header .nav-link.active:after {
        width: 80%;
      }
      
      header .nav-link.active,
      header .nav-link:hover {
        color: white !important;
      }
      
      header .navbar-toggler {
        border-color: rgba(255, 255, 255, 0.1);
        padding: 5px 10px;
      }
      
      header .navbar-toggler:focus {
        box-shadow: none;
        outline: none;
      }
      
      header .navbar-toggler-icon {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.85%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
      }
      
      @media (max-width: 991px) {
        header .navbar-collapse {
          background-color: ${websiteData.primaryColor};
          padding: 15px;
          border-radius: 8px;
          margin-top: 10px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        
        header .nav-link {
          padding: 10px !important;
          border-radius: 4px;
        }
        
        header .nav-link:hover,
        header .nav-link.active {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        header .nav-link:after {
          display: none;
        }
      }
    `;

    return {
      content: headerContent,
      css: headerCss
    };
  }

  /**
   * Create fallback footer for when generation fails
   * @param {Object} websiteData - Prepared website data
   * @returns {Object} Fallback footer object
   * @private
   */
  _createFallbackFooter(websiteData) {
    let footerContent = generationConfig.templates.fallbackHTML.footer;

    // Replace placeholders with actual data
    footerContent = footerContent.replace(/{{businessName}}/g, websiteData.businessName);
    footerContent = footerContent.replace(/{{businessDescription}}/g, websiteData.businessDescription);

    // Add contact information if available
    const addressHtml = websiteData.address
      ? websiteData.address
      : 'Address not provided';
    const emailHtml = websiteData.email
      ? `<a href="mailto:${websiteData.email}" class="text-white">${websiteData.email}</a>`
      : 'Email not provided';
    const phoneHtml = websiteData.phone
      ? `<a href="tel:${websiteData.phone}" class="text-white">${websiteData.phone}</a>`
      : 'Phone not provided';

    footerContent = footerContent.replace(/{{address}}/g, addressHtml);
    footerContent = footerContent.replace(/{{email}}/g, emailHtml);
    footerContent = footerContent.replace(/{{phone}}/g, phoneHtml);

    // Add social links if available
    if (websiteData.socialLinks) {
      let socialLinksHtml = '';

      if (websiteData.socialLinks.facebook) {
        socialLinksHtml += `<a href="https://facebook.com/${websiteData.socialLinks.facebook}" class="social-link" target="_blank"><i class="fab fa-facebook-f"></i></a>`;
      }

      if (websiteData.socialLinks.twitter) {
        socialLinksHtml += `<a href="https://twitter.com/${websiteData.socialLinks.twitter}" class="social-link" target="_blank"><i class="fab fa-twitter"></i></a>`;
      }

      if (websiteData.socialLinks.instagram) {
        socialLinksHtml += `<a href="https://instagram.com/${websiteData.socialLinks.instagram}" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>`;
      }

      if (websiteData.socialLinks.linkedin) {
        socialLinksHtml += `<a href="https://linkedin.com/company/${websiteData.socialLinks.linkedin}" class="social-link" target="_blank"><i class="fab fa-linkedin-in"></i></a>`;
      }

      if (socialLinksHtml) {
        footerContent = footerContent.replace(/<div class="social-links">[\s\S]*?<\/div>/g,
          `<div class="social-links">${socialLinksHtml}</div>`);
      }
    }

    // Create enhanced CSS
    const footerCss = `
      /* Footer Styles */
      footer {
        background-color: #343a40;
        color: white;
        padding: 80px 0 40px;
        position: relative;
        overflow: hidden;
      }
      
      footer:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(to right, ${websiteData.primaryColor}, ${websiteData.secondaryColor});
      }
      
      footer h5 {
        color: white;
        font-weight: 700;
        margin-bottom: 25px;
        position: relative;
        display: inline-block;
        font-size: 1.25rem;
      }
      
      footer h5:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 40px;
        height: 2px;
        background-color: ${websiteData.primaryColor};
      }
      
      footer p {
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.8;
        margin-bottom: 20px;
      }
      
      footer a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        transition: all 0.3s ease;
      }
      
      footer a:hover {
        color: white;
        text-decoration: none;
      }
      
      footer .social-links {
        margin-top: 20px;
      }
      
      footer .social-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        margin-right: 10px;
        font-size: 1rem;
        transition: all 0.3s ease;
      }
      
      footer .social-link:hover {
        background-color: ${websiteData.primaryColor};
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
      
      footer .small {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }
      
      footer .mb-0 {
        margin-bottom: 0;
      }
      
      @media (max-width: 767px) {
        footer {
          padding: 60px 0 30px;
        }
        
        footer .text-md-end {
          text-align: left !important;
          margin-top: 30px;
        }
      }
    `;

    return {
      content: footerContent,
      css: footerCss
    };
  }

  /**
   * Create fallback sections for a page when generation fails
   * @param {string} pageName - Name of the page
   * @param {Object} websiteData - Prepared website data
   * @returns {Array} Array of fallback sections
   * @private
   */
  _createFallbackSections(pageName, websiteData) {
    const pageNameLower = pageName.toLowerCase();
    let pageSections = [];

    // Get appropriate section structure based on page type
    const pageType =
      pageNameLower === 'home' ? 'home' :
        pageNameLower.includes('about') ? 'about' :
          pageNameLower.includes('service') ? 'services' :
            pageNameLower.includes('contact') ? 'contact' :
              pageNameLower.includes('blog') ? 'blog' :
                'default';

    const sectionTemplates = generationConfig.templates.pageStructures[pageType] ||
      generationConfig.templates.pageStructures.default;

    // Create a section for each template
    sectionTemplates.forEach(template => {
      const sectionId = `section-${template.name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create a basic section with placeholder content
      const section = {
        sectionReference: sectionId,
        content: this._createBasicSectionContent(template.title, template.name, websiteData, pageNameLower),
        css: this._createBasicSectionCss(sectionId, template.name, websiteData)
      };

      pageSections.push(section);
    });

    return pageSections;
  }

  /**
   * Create basic section content for fallback
   * @param {string} title - Section title
   * @param {string} type - Section type
   * @param {Object} websiteData - Website data
   * @param {string} pageName - Page name in lowercase
   * @returns {string} Basic HTML content
   * @private
   */
  _createBasicSectionContent(title, type, websiteData, pageName) {
    const { businessName, businessDescription } = websiteData;

    if (type === 'hero') {
      return `
        <section id="section-hero" class="py-5 bg-light">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-lg-6">
                <h1 class="display-4 fw-bold">${businessName}</h1>
                <p class="lead">${businessDescription}</p>
                <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                  <button type="button" class="btn btn-primary btn-lg px-4 me-md-2">Get Started</button>
                  <button type="button" class="btn btn-outline-secondary btn-lg px-4">Learn More</button>
                </div>
              </div>
              <div class="col-lg-6">
                <img src="https://via.placeholder.com/600x400" class="img-fluid rounded" alt="Hero Image">
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'intro' || type === 'overview') {
      return `
        <section id="section-intro" class="py-5">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">${title}</h2>
                <p class="lead">
                  ${businessDescription} Our commitment to excellence sets us apart from the competition.
                </p>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col-md-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <div class="feature-icon">
                      <i class="fas fa-check-circle fa-3x text-primary mb-3"></i>
                    </div>
                    <h3 class="card-title h5">Quality Service</h3>
                    <p class="card-text">We provide top quality service to all our clients.</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <div class="feature-icon">
                      <i class="fas fa-users fa-3x text-primary mb-3"></i>
                    </div>
                    <h3 class="card-title h5">Expert Team</h3>
                    <p class="card-text">Our experienced team is ready to help you.</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <div class="feature-icon">
                      <i class="fas fa-clock fa-3x text-primary mb-3"></i>
                    </div>
                    <h3 class="card-title h5">Fast Response</h3>
                    <p class="card-text">Quick response time to all your needs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'features' || type === 'services' || type === 'details') {
      return `
        <section id="section-features" class="py-5 bg-light">
          <div class="container">
            <div class="row justify-content-center mb-5">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">${title}</h2>
                <p class="lead">Discover what we offer to meet your needs.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <i class="fas fa-star text-primary mb-3"></i>
                    <h3 class="card-title h5">Service One</h3>
                    <p class="card-text">A comprehensive description of our first service and how it benefits you.</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <i class="fas fa-cog text-primary mb-3"></i>
                    <h3 class="card-title h5">Service Two</h3>
                    <p class="card-text">A comprehensive description of our second service and how it benefits you.</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <i class="fas fa-heart text-primary mb-3"></i>
                    <h3 class="card-title h5">Service Three</h3>
                    <p class="card-text">A comprehensive description of our third service and how it benefits you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'testimonials') {
      return `
        <section id="section-testimonials" class="py-5">
          <div class="container">
            <div class="row justify-content-center mb-5">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">What Our Clients Say</h2>
                <p class="lead">Hear from our satisfied customers about their experiences with us.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-center mb-3">
                      <div class="text-warning">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </div>
                    </div>
                    <p class="card-text text-center">"Working with ${businessName} has been an excellent experience. Their team is professional and delivers quality results."</p>
                    <div class="text-center mt-3">
                      <h5 class="card-title mb-0">John Smith</h5>
                      <p class="text-muted small">Happy Customer</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-center mb-3">
                      <div class="text-warning">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                      </div>
                    </div>
                    <p class="card-text text-center">"I highly recommend ${businessName}. Their attention to detail and customer service are outstanding."</p>
                    <div class="text-center mt-3">
                      <h5 class="card-title mb-0">Jane Doe</h5>
                      <p class="text-muted small">Satisfied Client</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-4">
                <div class="card h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-center mb-3">
                      <div class="text-warning">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                      </div>
                    </div>
                    <p class="card-text text-center">"The team at ${businessName} exceeded my expectations. They were responsive, professional, and delivered on time."</p>
                    <div class="text-center mt-3">
                      <h5 class="card-title mb-0">Michael Johnson</h5>
                      <p class="text-muted small">Repeat Customer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'form' && pageName.includes('contact')) {
      return `
        <section id="section-contact-form" class="py-5">
          <div class="container">
            <div class="row justify-content-center mb-5">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">Get in Touch</h2>
                <p class="lead">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
              </div>
            </div>
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <form>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label for="name" class="form-label">Your Name</label>
                      <input type="text" class="form-control" id="name" placeholder="John Smith" required>
                    </div>
                    <div class="col-md-6">
                      <label for="email" class="form-label">Email Address</label>
                      <input type="email" class="form-control" id="email" placeholder="john@example.com" required>
                    </div>
                    <div class="col-md-6">
                      <label for="phone" class="form-label">Phone Number</label>
                      <input type="tel" class="form-control" id="phone" placeholder="(123) 456-7890">
                    </div>
                    <div class="col-md-6">
                      <label for="subject" class="form-label">Subject</label>
                      <select class="form-select" id="subject" required>
                        <option value="" selected disabled>Choose a subject...</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="quote">Request a Quote</option>
                      </select>
                    </div>
                    <div class="col-12">
                      <label for="message" class="form-label">Message</label>
                      <textarea class="form-control" id="message" rows="5" placeholder="Your message here..." required></textarea>
                    </div>
                    <div class="col-12">
                      <div class="d-grid">
                        <button type="submit" class="btn btn-primary btn-lg">Send Message</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'map' && websiteData.hasGoogleMap) {
      return `
        <section id="section-map" class="py-5 bg-light">
          <div class="container">
            <div class="row justify-content-center mb-5">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">Find Us</h2>
                <p class="lead">Visit our location to learn more about our services.</p>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="map-container">
                  ${websiteData.googleMapUrl ?
          `<iframe src="${websiteData.googleMapUrl}" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` :
          `<div class="map-placeholder bg-secondary text-white d-flex align-items-center justify-content-center" style="height: 450px;">
                      <div class="text-center">
                        <i class="fas fa-map-marker-alt fa-3x mb-3"></i>
                        <h3>Map Placeholder</h3>
                        <p>A Google Map would be displayed here</p>
                      </div>
                    </div>`
        }
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (type === 'cta') {
      return `
        <section id="section-cta" class="py-5 bg-primary text-white">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-8 text-center">
                <h2 class="section-title">Ready to Get Started?</h2>
                <p class="lead">Contact us today to learn more about our services and how we can help you.</p>
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-center mt-4">
                  <button type="button" class="btn btn-light btn-lg px-4 me-sm-3">Contact Us</button>
                  <button type="button" class="btn btn-outline-light btn-lg px-4">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    // Default section content for any other section type
    return `
      <section id="section-${type}" class="py-5">
        <div class="container">
          <div class="row justify-content-center mb-5">
            <div class="col-lg-8 text-center">
              <h2 class="section-title">${title}</h2>
              <p class="lead">Information about ${businessName} and our offerings.</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <p>
                ${businessDescription} We are committed to providing the best service to our customers.
              </p>
              <ul class="list-unstyled">
                <li><i class="fas fa-check text-success me-2"></i> Quality Service</li>
                <li><i class="fas fa-check text-success me-2"></i> Professional Team</li>
                <li><i class="fas fa-check text-success me-2"></i> Customer Satisfaction</li>
              </ul>
            </div>
            <div class="col-md-6">
              <img src="https://via.placeholder.com/600x400" class="img-fluid rounded" alt="Section Image">
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Create basic section CSS for fallback
   * @param {string} sectionId - Section ID
   * @param {string} type - Section type
   * @param {Object} websiteData - Website data
   * @returns {string} Basic CSS content
   * @private
   */
  _createBasicSectionCss(sectionId, type, websiteData) {
    const { primaryColor, secondaryColor, fontFamily } = websiteData;

    // Basic shared CSS for all sections
    let commonCss = `
      #${sectionId} {
        padding: 80px 0;
        position: relative;
        overflow: hidden;
      }
      
      #${sectionId} .section-title {
        color: ${type === 'cta' ? 'white' : '#333'};
        margin-bottom: 30px;
        font-weight: 700;
        font-size: 2.5rem;
        position: relative;
        display: inline-block;
      }
      
      #${sectionId} .section-title:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 60px;
        height: 3px;
        background-color: ${primaryColor};
      }
      
      #${sectionId} .lead {
        font-size: 1.25rem;
        line-height: 1.7;
        margin-bottom: 40px;
        color: ${type === 'cta' ? 'rgba(255,255,255,0.9)' : '#666'};
      }
      
      #${sectionId} p {
        line-height: 1.7;
        margin-bottom: 20px;
      }
      
      #${sectionId} .btn-primary {
        background-color: ${primaryColor};
        border-color: ${primaryColor};
        padding: 12px 30px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      
      #${sectionId} .btn-primary:hover {
        background-color: ${this._darkenColor(primaryColor, 10)};
        border-color: ${this._darkenColor(primaryColor, 10)};
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
      }
      
      #${sectionId} .text-primary {
        color: ${primaryColor} !important;
      }
      
      #${sectionId} img {
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      
      #${sectionId} img:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
      }
      
      #${sectionId} .card {
        border: none;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        height: 100%;
      }
      
      #${sectionId} .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.12);
      }
      
      #${sectionId} .card-body {
        padding: 30px;
      }
      
      #${sectionId} .card-title {
        font-weight: 700;
        margin-bottom: 15px;
        color: #333;
      }
      
      #${sectionId} ul li {
        margin-bottom: 10px;
        position: relative;
        padding-left: 25px;
      }
      
      #${sectionId} ul li:before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: ${primaryColor};
      }
      
      @media (max-width: 991px) {
        #${sectionId} {
          padding: 60px 0;
        }
        
        #${sectionId} .section-title {
          font-size: 2rem;
        }
      }
      
      @media (max-width: 767px) {
        #${sectionId} {
          padding: 50px 0;
        }
        
        #${sectionId} .section-title {
          font-size: 1.75rem;
        }
      }
    `;

    // Add section-specific CSS
    if (type === 'hero') {
      return commonCss + `
        #${sectionId} {
          padding: 120px 0;
          background-color: ${this._lightenColor(primaryColor, 90)};
          position: relative;
        }
        
        #${sectionId}:before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 40%;
          height: 100%;
          background-color: ${this._lightenColor(primaryColor, 85)};
          clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
          z-index: 0;
        }
        
        #${sectionId} .container {
          position: relative;
          z-index: 1;
        }
        
        #${sectionId} h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 25px;
          color: #333;
        }
        
        #${sectionId} .btn {
          margin-top: 15px;
          padding: 15px 35px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        #${sectionId} .btn-primary {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
          transition: all 0.3s ease;
        }
        
        #${sectionId} .btn-primary:hover {
          background-color: ${this._darkenColor(primaryColor, 10)};
          border-color: ${this._darkenColor(primaryColor, 10)};
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }
        
        #${sectionId} .btn-outline-secondary {
          color: #555;
          border-color: #ddd;
          background-color: white;
          transition: all 0.3s ease;
        }
        
        #${sectionId} .btn-outline-secondary:hover {
          background-color: #f8f9fa;
          border-color: #ccc;
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 991px) {
          #${sectionId} h1 {
            font-size: 2.8rem;
          }
          
          #${sectionId}:before {
            width: 25%;
          }
        }
        
        @media (max-width: 767px) {
          #${sectionId} {
            padding: 80px 0;
          }
          
          #${sectionId} h1 {
            font-size: 2.2rem;
          }
          
          #${sectionId}:before {
            display: none;
          }
        }
      `;
    }

    if (type === 'cta') {
      return commonCss + `
        #${sectionId} {
          padding: 100px 0;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${this._darkenColor(primaryColor, 20)} 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        #${sectionId}:before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        #${sectionId}:after {
          content: '';
          position: absolute;
          bottom: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        #${sectionId} .section-title {
          color: white;
        }
        
        #${sectionId} .section-title:after {
          background-color: white;
        }
        
        #${sectionId} .btn-light {
          background-color: white;
          color: ${primaryColor};
          font-weight: 600;
          padding: 15px 35px;
          border-radius: 30px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        #${sectionId} .btn-light:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }
        
        #${sectionId} .btn-outline-light {
          color: white;
          border-color: rgba(255,255,255,0.5);
          padding: 15px 35px;
          border-radius: 30px;
          transition: all 0.3s ease;
        }
        
        #${sectionId} .btn-outline-light:hover {
          background-color: rgba(255,255,255,0.1);
          border-color: white;
          transform: translateY(-3px);
        }
      `;
    }

    if (type === 'testimonials') {
      return commonCss + `
        #${sectionId} {
          background-color: #f9fafb;
          position: relative;
          overflow: hidden;
        }
        
        #${sectionId}:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${primaryColor}' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.6;
        }
        
        #${sectionId} .container {
          position: relative;
          z-index: 1;
        }
        
        #${sectionId} .card {
          background-color: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        
        #${sectionId} .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        #${sectionId} .card-body {
          padding: 40px 30px;
          position: relative;
        }
        
        #${sectionId} .card-body:before {
          content: '"';
          position: absolute;
          top: 20px;
          left: 20px;
          font-size: 80px;
          color: ${this._lightenColor(primaryColor, 80)};
          font-family: Georgia, serif;
          line-height: 1;
          z-index: 0;
        }
        
        #${sectionId} .card-text {
          position: relative;
          z-index: 1;
          font-style: italic;
          line-height: 1.8;
        }
        
        #${sectionId} .text-warning {
          color: #ffaa00 !important;
        }
        
        #${sectionId} .text-center h5 {
          margin-top: 20px;
          font-weight: 700;
        }
        
        #${sectionId} .text-muted {
          font-size: 0.9rem;
        }
    `;
    }
  }

  /**
   * Lighten a hex color by a percentage
   * @param {string} color - Hex color to lighten
   * @param {number} percent - Percentage to lighten by
   * @returns {string} Lightened color
   * @private
   */
  _lightenColor(color, percent) {
    // Remove the # if it exists
    color = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Lighten
    const lightenAmount = percent / 100;
    const lr = Math.min(255, Math.floor(r + (255 - r) * lightenAmount));
    const lg = Math.min(255, Math.floor(g + (255 - g) * lightenAmount));
    const lb = Math.min(255, Math.floor(b + (255 - b) * lightenAmount));

    // Convert back to hex
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  }

  /**
   * Darken a hex color by a percentage
   * @param {string} color - Hex color to darken
   * @param {number} percent - Percentage to darken by
   * @returns {string} Darkened color
   * @private
   */
  _darkenColor(color, percent) {
    // Remove the # if it exists
    color = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Darken
    const darkenAmount = percent / 100;
    const dr = Math.floor(r * (1 - darkenAmount));
    const dg = Math.floor(g * (1 - darkenAmount));
    const db = Math.floor(b * (1 - darkenAmount));

    // Convert back to hex
    return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
  }

  /**
   * Execute a generator function with retries
   * @param {Function} generatorFn - The function to execute
   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Promise<any>} Function result or null
   * @private
   */
  // Update the _generateWithRetry method
  async _generateWithRetry(generatorFn, maxRetries) {
    let attempts = 0;
    let lastError = null;

    while (attempts < maxRetries) {
      try {
        const result = await generatorFn();
        // If we get a result (even a fallback one), return it
        if (result) return result;
      } catch (error) {
        lastError = error;
        attempts++;

        // Log the retry attempt
        console.log(`Generation attempt ${attempts} failed. Retrying in ${this._getRetryDelay(attempts)}ms...`);

        // If this is the last attempt, break
        if (attempts >= maxRetries) {
          break;
        }

        // Wait before retrying (with exponential backoff)
        await this._wait(this._getRetryDelay(attempts));
      }
    }

    console.error(`All ${maxRetries} generation attempts failed:`, lastError);

    // Instead of returning null, return a fallback result
    return this._createFallbackResult();
  }

  // Add helper methods for retry mechanism
  _getRetryDelay(attempt) {
    const initialDelay = 1000;
    const maxDelay = 10000;
    return Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  _createFallbackResult() {
    // Return a minimal valid structure
    return {
      content: "Fallback content due to generation failure",
      css: "/* Fallback CSS */"
    };
  }

  // Add this method to the GenerationService class in services/generationService.js

  /**
 * Generate a specific page with sections
 * @param {string} pageName - Name of the page to generate
 * @param {Object} websiteData - Prepared website data
 * @returns {Promise<Array>} Array of page sections
 * @private
 */
  // async _generatePage(pageName, websiteData) {
  //   try {
  //     console.log(`Generating ${pageName} page content`);
  //     // Get the page prompt
  //     const pagePrompt = promptBuilder.buildPagePrompt(pageName, websiteData);

  //     // Generate page content
  //     const pageContent = await this._generateWithRetry(
  //       async () => {
  //         const response = await ollamaService.generateText(
  //           pagePrompt,
  //           {
  //             ...generationConfig.generation.jsonParams,
  //             format: "json"  // Add a format hint
  //           }
  //         );
  //         return contentProcessor.processJsonContent(response);
  //       },
  //       generationConfig.generation.retry.attempts
  //     );

  //     // Check if we have valid sections
  //     if (pageContent && pageContent.sections && Array.isArray(pageContent.sections)) {
  //       // Make sure each section has all required properties
  //       return pageContent.sections.map(section => {
  //         // Ensure we have a valid section reference
  //         const sectionRef = section.sectionReference || `section-${pageName.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  //         return {
  //           sectionReference: sectionRef,
  //           content: section.content || `<div class="container"><h2>${pageName} Content</h2><p>Content for ${pageName}</p></div>`,
  //           css: section.css || ''
  //         };
  //       });
  //     }

  //     // If generation failed, use fallback sections
  //     console.warn(`Page generation failed for ${pageName}. Using fallback sections.`);
  //     return this._createFallbackSections(pageName, websiteData);
  //   } catch (error) {
  //     console.error(`Error generating page ${pageName}:`, error);
  //     return this._createFallbackSections(pageName, websiteData);
  //   }
  // }

  async _generatePage(pageName, websiteData) {
  try {
    console.log(`Generating ${pageName} page content`);

    // Get the page prompt
    const pagePrompt = promptBuilder.buildPagePrompt(pageName, websiteData);

    // Generate page content with better error handling
    const pageContent = await this._generateWithRetry(
      async () => {
        console.log(`Generating ${pageName} page attempt`);
        const response = await ollamaService.generateText(pagePrompt, generationParams);

        // Process the response
        const processed = await contentProcessor.processJsonContent(
          response, 
          'page', 
          pageName
        );

        // Validate the result is still needed, but most issues should have been fixed by the AI
        if (processed && processed.sections && Array.isArray(processed.sections)) {
          if (processed.sections.length > 0) {
            console.log(`Successfully generated ${processed.sections.length} valid sections for ${pageName}`);
            return processed;
          }
        }

        console.log(`Invalid page content structure for ${pageName}`);
        return null; // Will trigger retry
      },
      generationConfig.generation.retry.attempts
    );

    // Final validation and preparation of page content
    if (pageContent && pageContent.sections && Array.isArray(pageContent.sections) && pageContent.sections.length > 0) {
      return pageContent.sections;
    }

    // If generation still failed, use fallback sections
    console.warn(`Page generation failed for ${pageName}. Using fallback sections.`);
    return this._createFallbackSections(pageName, websiteData);
  } catch (error) {
    console.error(`Error generating page ${pageName}:`, error);
    return this._createFallbackSections(pageName, websiteData);
  }
}

}

module.exports = new GenerationService();