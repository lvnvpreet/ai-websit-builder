const ollamaService = require('./ollamaService');
const promptBuilder = require('./promptBuilder');
const contentProcessor = require('./contentProcessor');
const generationConfig = require('../config/generationConfig');
const Website = require('../models/Website');
const Page = require('../models/Page');

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
      // Get the page prompt
      const pagePrompt = promptBuilder.buildPagePrompt(pageName, websiteData);

      console.log(pagePrompt)

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

      console.log(pageContent)

      // Check if we have valid sections
      if (pageContent && pageContent.sections && Array.isArray(pageContent.sections)) {
        return pageContent.sections.map(section => ({
          sectionReference: section.sectionReference || `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          content: section.content || '',
          css: section.css || ''
        }));
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
   * Save generated content to the database
   * @param {Object} websiteDoc - Website document from database
   * @param {Object} result - Generated website content
   * @returns {Promise<void>}
   * @private
   */
  async _saveToDatabase(websiteDoc, result) {
    try {
      // 1. Update website with header and footer
      websiteDoc.header = result.header;
      websiteDoc.footer = result.footer;
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
        ? website.pages.map(p => typeof p === 'string' ? p : 'Page')
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

    // Create basic CSS
    const headerCss = `
      header.navbar {
        background-color: ${websiteData.primaryColor} !important;
      }
      header .navbar-brand {
        color: white;
        font-weight: bold;
      }
      header .nav-link {
        color: rgba(255, 255, 255, 0.85) !important;
      }
      header .nav-link.active, header .nav-link:hover {
        color: white !important;
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
        socialLinksHtml += `<a href="https://facebook.com/${websiteData.socialLinks.facebook}" class="text-white me-2" target="_blank"><i class="fab fa-facebook"></i></a>`;
      }

      if (websiteData.socialLinks.twitter) {
        socialLinksHtml += `<a href="https://twitter.com/${websiteData.socialLinks.twitter}" class="text-white me-2" target="_blank"><i class="fab fa-twitter"></i></a>`;
      }

      if (websiteData.socialLinks.instagram) {
        socialLinksHtml += `<a href="https://instagram.com/${websiteData.socialLinks.instagram}" class="text-white me-2" target="_blank"><i class="fab fa-instagram"></i></a>`;
      }

      if (websiteData.socialLinks.linkedin) {
        socialLinksHtml += `<a href="https://linkedin.com/company/${websiteData.socialLinks.linkedin}" class="text-white me-2" target="_blank"><i class="fab fa-linkedin"></i></a>`;
      }

      if (socialLinksHtml) {
        footerContent = footerContent.replace(/<div class="social-links">[\s\S]*?<\/div>/g,
          `<div class="social-links">${socialLinksHtml}</div>`);
      }
    }

    // Create basic CSS
    const footerCss = `
      footer {
        background-color: #343a40 !important;
      }
      footer h5 {
        color: ${websiteData.secondaryColor};
        font-weight: bold;
        margin-bottom: 1rem;
      }
      footer a {
        text-decoration: none;
        transition: opacity 0.3s;
      }
      footer a:hover {
        opacity: 0.8;
        text-decoration: underline;
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
    const { primaryColor, secondaryColor } = websiteData;

    return `
      #${sectionId} {
        padding: 60px 0;
      }
      #${sectionId} .section-title {
        color: ${type === 'cta' ? 'white' : '#333'};
        margin-bottom: 20px;
        font-weight: 700;
      }
      #${sectionId} .lead {
        margin-bottom: 30px;
      }
      #${sectionId} .btn-primary {
        background-color: ${primaryColor};
        border-color: ${primaryColor};
      }
      #${sectionId} .btn-primary:hover {
        background-color: ${this._darkenColor(primaryColor, 10)};
        border-color: ${this._darkenColor(primaryColor, 10)};
      }
      #${sectionId} .text-primary {
        color: ${primaryColor} !important;
      }
      ${type === 'cta' ? `
      #${sectionId} {
        background-color: ${primaryColor};
        color: white;
      }` : ''}
      ${type === 'testimonials' ? `
      #${sectionId} .card {
        transition: all 0.3s ease;
      }
      #${sectionId} .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }` : ''}
    `;
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
async _generatePage(pageName, websiteData) {
  try {
    // Get the page prompt
    const pagePrompt = promptBuilder.buildPagePrompt(pageName, websiteData);
    
    // Generate page content
    const pageContent = await this._generateWithRetry(
      async () => {
        const response = await ollamaService.generateText(
          pagePrompt, 
          {
            ...generationConfig.generation.jsonParams,
            format: "json"  // Add a format hint
          }
        );
        return contentProcessor.processJsonContent(response);
      },
      generationConfig.generation.retry.attempts
    );
    
    // Check if we have valid sections
    if (pageContent && pageContent.sections && Array.isArray(pageContent.sections)) {
      // Make sure each section has all required properties
      return pageContent.sections.map(section => {
        // Ensure we have a valid section reference
        const sectionRef = section.sectionReference || `section-${pageName.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        return {
          sectionReference: sectionRef,
          content: section.content || `<div class="container"><h2>${pageName} Content</h2><p>Content for ${pageName}</p></div>`,
          css: section.css || ''
        };
      });
    }
    
    // If generation failed, use fallback sections
    console.warn(`Page generation failed for ${pageName}. Using fallback sections.`);
    return this._createFallbackSections(pageName, websiteData);
  } catch (error) {
    console.error(`Error generating page ${pageName}:`, error);
    return this._createFallbackSections(pageName, websiteData);
  }
}
}

module.exports = new GenerationService();