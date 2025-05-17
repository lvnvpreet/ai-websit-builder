const axios = require('axios');
const config = require('../config/ollamaConfig');

class OllamaService {
  constructor() {
    try {
      this.baseUrl = config?.serverUrl || process.env.OLLAMA_URL || 'http://175.111.130.242:11434';
      this.model = config?.defaultModel || process.env.OLLAMA_MODEL || 'qwq:32b-preview-q8_0';
      this.defaultParams = config?.defaultParams || {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stop: []
      };

      // Log initialization details for debugging
      console.log('OllamaService initialized with:');
      console.log(`- baseUrl: ${this.baseUrl}`);
      console.log(`- model: ${this.model}`);
    } catch (error) {
      console.error('Error initializing OllamaService:', error);
      // Set fallback values if initialization fails
      this.baseUrl = 'http://175.111.130.242:11434';
      this.model = 'qwq:32b-preview-q8_0';
      this.defaultParams = {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stop: []
      };
    }
  }

  /**
   * Check if the Ollama server is accessible
   * @returns {Promise<boolean>} True if server is running
   */
  /**
 * Check if the Ollama server is accessible and the model is available
 * @param {string} serverUrl - Optional custom server URL
 * @returns {Promise<boolean>} True if server is running
 */
  async isServerRunning(serverUrl = null) {
    try {
      // Use provided serverUrl or default to the instance's baseUrl
      const url = serverUrl || this.baseUrl;

      // Remove any trailing slash
      const cleanUrl = url.replace(/\/$/, '');
      const apiUrl = `${cleanUrl}/api/tags`;

      console.log(`Checking Ollama server at: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        timeout: 10000  // 10 second timeout for checking server status
      });

      if (response.status === 200) {
        console.log('Ollama server is running');

        // Check if the model exists
        const models = response.data.models || [];
        const modelExists = models.some(model => model.name === this.model);

        if (!modelExists) {
          console.warn(`Model "${this.model}" not found on the Ollama server`);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking Ollama server:', error.message);
      return false;
    }
  }

  /**
   * Get available models from the Ollama server
   * @param {string} serverUrl - Optional custom server URL
   * @returns {Promise<Array>} List of available models
   */
  async getOllamaModels(serverUrl = null) {
    try {
      // Use provided serverUrl or default to the instance's baseUrl
      const url = serverUrl || this.baseUrl;

      // Remove any trailing slash
      const cleanUrl = url.replace(/\/$/, '');
      const apiUrl = `${cleanUrl}/api/tags`;

      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      return (response.data.models || []).map(model => model.name);
    } catch (error) {
      console.error('Error fetching Ollama models:', error.message);
      return [];
    }
  }
  /**
   * List available models on the Ollama server
   * @returns {Promise<Array>} List of available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 10000
      });
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error.message);
      return [];
    }
  }

  /**
   * Generate text with Ollama
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @returns {Promise<string>} Generated text
   */

  // When generating text:
  async generateText(prompt, params = {}) {
    try {
      console.log(`Generating text with model: ${this.model}`);

      // If asking for JSON, modify the prompt to make it more reliable
      let modifiedPrompt = prompt;
      if (prompt.includes("JSON") || prompt.includes("json") || params.format === "json") {
        modifiedPrompt = `${prompt.trim()}\n\nIMPORTANT: Your response must be valid JSON only. Do not include any other text, markdown formatting, or code blocks. Make sure to properly escape all quotes and special characters in strings. Use double quotes for all keys and string values.`;
      }

      const requestParams = {
        ...this.defaultParams,
        ...params
      };

      // For JSON requests, use safer parameters
      if (prompt.includes("JSON") || prompt.includes("json") || params.format === "json") {
        requestParams.temperature = Math.min(requestParams.temperature || 0.7, 0.2);
        requestParams.top_p = Math.min(requestParams.top_p || 0.9, 0.8);
        requestParams.max_tokens = Math.max(requestParams.max_tokens || 4096, 8192); // Ensure enough tokens
      }

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: modifiedPrompt,
        stream: false,
        ...requestParams
      }, {
        timeout: 1800000, // 30 minutes
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating text with Ollama:', error.message);
      return '{"content": "Generation failed due to API error", "css": "/* Fallback CSS */"}';
    }
  }

  /**
   * Generate a JSON response with Ollama
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Generated JSON object
   */
  async generateJson(prompt, params = {}) {
    try {
      // Enhance the JSON instructions with explicit formatting guidance
      const jsonPrompt = `${prompt}
  
        IMPORTANT FORMATTING INSTRUCTIONS:
        1. Your response must be a valid JSON object ONLY
        2. Do not include anything outside the JSON object
        3. Do not include any markdown formatting or code blocks
        4. Use double quotes for all property names and string values
        5. Properly escape any quotes or special characters in strings
        6. Do not use comments or explanations in the JSON
        7. Format your response like the following JSON format ONLY:
        {
          "property1": "value1",
          "property2": "value2",
          "array": [
            {
              "item1": "value"
            }
          ]
        }`;

      // Set more appropriate parameters for JSON generation
      const jsonParams = {
        ...params,
        temperature: 0.1,  // Reduce temperature for more consistent formatting
        top_p: 0.7,       // Lower top_p for more deterministic output
        max_tokens: 12000  // Keep high token limit for detailed content
      };

      // Generate the response
      const response = await this.generateText(jsonPrompt, jsonParams);

      // Process the response using ContentProcessor
      const contentProcessor = require('./contentProcessor');
      return contentProcessor.processJsonContent(response);
    } catch (error) {
      console.error('Error generating JSON with Ollama:', error.message);

      // Return a valid fallback object
      return {
        content: "Fallback content due to generation error",
        css: "/* Fallback CSS */"
      };
    }
  }

  /**
   * Fix common JSON string issues
   * @param {string} jsonStr - The JSON string to fix
   * @returns {string} Fixed JSON string
   */
  fixJsonString(jsonStr) {
    // Replace single quotes with double quotes
    let fixed = jsonStr.replace(/'/g, '"');

    // Add quotes to unquoted keys
    fixed = fixed.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    // Remove trailing commas in objects and arrays
    fixed = fixed.replace(/,\s*([\]}])/g, '$1');

    return fixed;
  }

  // Add this method to the OllamaService class in services/ollamaService.js

  /**
   * Generate JSON response with better error handling
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Generated JSON object
   */
  async generateJson(prompt, params = {}) {
    try {
      // Add explicit JSON instructions to the prompt
      const jsonPrompt = `${prompt}\n\nYour response must be a valid JSON object with proper formatting. Do not include any text outside of the JSON object. Do not add markdown formatting or code blocks.`;

      // Set more appropriate parameters for JSON generation
      const jsonParams = {
        ...params,
        temperature: Math.min(params.temperature || 0.2, 0.2), // Lower temperature for more deterministic output
        top_p: Math.min(params.top_p || 0.8, 0.8),            // More focused sampling
      };

      // Generate the response
      const response = await this.generateText(jsonPrompt, jsonParams);

      // Process the response using ContentProcessor
      const contentProcessor = require('./contentProcessor');
      return contentProcessor.processJsonContent(response);
    } catch (error) {
      console.error('Error generating JSON with Ollama:', error.message);

      // Return a valid fallback object
      return {
        content: "Fallback content due to generation error",
        css: "/* Fallback CSS */"
      };
    }
  }

  /**
   * Generate HTML content for a website component
   * @param {string} component - Component type (header, footer, section)
   * @param {Object} websiteData - Website configuration data
   * @returns {Promise<Object>} Generated HTML and CSS
   */
  async generateComponent(component, websiteData) {
    try {
      const prompt = this.createComponentPrompt(component, websiteData);
      const result = await this.generateJson(prompt);

      return {
        content: result.content || '',
        css: result.css || ''
      };
    } catch (error) {
      console.error(`Error generating ${component}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate a complete website based on wizard data
   * @param {Object} websiteData - Complete website configuration
   * @param {Function} progressCallback - Function to report progress
   * @returns {Promise<Object>} Generated website content
   */
  async generateWebsite(websiteData, progressCallback) {
    try {
      // Initialize the website object
      const website = {
        header: null,
        footer: null,
        pages: []
      };

      // Update progress
      if (progressCallback) {
        progressCallback(5, 'Starting website generation');
      }

      // 1. Generate header
      if (progressCallback) {
        progressCallback(10, 'Generating header');
      }
      website.header = await this.generateComponent('header', websiteData);

      // 2. Generate footer
      if (progressCallback) {
        progressCallback(20, 'Generating footer');
      }
      website.footer = await this.generateComponent('footer', websiteData);

      // 3. Generate pages
      const pagePromises = [];
      const pageCount = websiteData.pages.length;

      for (let i = 0; i < pageCount; i++) {
        const pageName = websiteData.pages[i];

        // Calculate progress percentage
        const startProgress = 20 + (i * (60 / pageCount));
        const endProgress = 20 + ((i + 1) * (60 / pageCount));

        if (progressCallback) {
          progressCallback(startProgress, `Generating ${pageName} page`);
        }

        // Generate page content
        const pagePromise = this.generatePage(pageName, websiteData, website.header, website.footer)
          .then(pageContent => {
            if (progressCallback) {
              progressCallback(endProgress, `Completed ${pageName} page`);
            }
            return {
              name: pageName,
              slug: pageName === 'Home' ? '/' : pageName.toLowerCase().replace(/\s+/g, '-'),
              content: pageContent
            };
          });

        pagePromises.push(pagePromise);
      }

      // Wait for all pages to be generated
      website.pages = await Promise.all(pagePromises);

      // 4. Final processing
      if (progressCallback) {
        progressCallback(95, 'Finalizing website');
      }

      // Return the complete website
      if (progressCallback) {
        progressCallback(100, 'Website generation complete');
      }

      return website;
    } catch (error) {
      console.error('Error generating website:', error.message);
      throw error;
    }
  }

  /**
   * Generate a complete page with sections
   * @param {string} pageName - Name of the page
   * @param {Object} websiteData - Website configuration
   * @param {Object} header - Header content and CSS
   * @param {Object} footer - Footer content and CSS
   * @returns {Promise<Array>} Array of page sections
   */
  async generatePage(pageName, websiteData, header, footer) {
    try {
      const prompt = this.createPagePrompt(pageName, websiteData, header, footer);
      const result = await this.generateJson(prompt);

      // Ensure the result is an array of sections
      if (!Array.isArray(result.sections)) {
        throw new Error(`Invalid page generation result for ${pageName}: sections not found or not an array`);
      }

      return result.sections;
    } catch (error) {
      console.error(`Error generating page ${pageName}:`, error.message);
      throw error;
    }
  }

  /**
   * Create a prompt for component generation
   * @param {string} component - Component type
   * @param {Object} websiteData - Website configuration
   * @returns {string} Formatted prompt
   */
  createComponentPrompt(component, websiteData) {
    const {
      businessName,
      businessCategory,
      businessDescription,
      websiteTitle,
      websiteTagline,
      websiteType,
      websitePurpose,
      primaryColor,
      secondaryColor,
      fontFamily,
      fontStyle,
      pages,
      address,
      email,
      phone,
      socialLinks
    } = websiteData;

    let prompt = '';

    if (component === 'header') {
      prompt = `
        Create a responsive header for a website with the following details:
        
        Business Name: ${businessName}
        Business Category: ${businessCategory}
        Website Title: ${websiteTitle}
        Website Tagline: ${websiteTagline}
        Website Type: ${websiteType}
        
        The header should include:
        - The business name/logo
        - A responsive navigation menu with the following pages: ${pages.join(', ')}
        - Mobile-friendly design with a hamburger menu
        
        Style Guidelines:
        - Primary Color: ${primaryColor}
        - Secondary Color: ${secondaryColor}
        - Font Family: ${fontFamily}
        - Font Style: ${fontStyle}
        
        Return a JSON object with 'content' (the HTML code) and 'css' (the CSS styling).
        Use Bootstrap 5 for the responsive design.
      `;
    } else if (component === 'footer') {
      prompt = `
        Create a responsive footer for a website with the following details:
        
        Business Name: ${businessName}
        Business Category: ${businessCategory}
        Website Type: ${websiteType}
        
        Contact Information:
        ${address ? `- Address: ${address}` : ''}
        ${email ? `- Email: ${email}` : ''}
        ${phone ? `- Phone: ${phone}` : ''}
        
        Social Media Links:
        ${socialLinks?.facebook ? `- Facebook: facebook.com/${socialLinks.facebook}` : ''}
        ${socialLinks?.instagram ? `- Instagram: instagram.com/${socialLinks.instagram}` : ''}
        ${socialLinks?.twitter ? `- Twitter: twitter.com/${socialLinks.twitter}` : ''}
        ${socialLinks?.linkedin ? `- LinkedIn: linkedin.com/company/${socialLinks.linkedin}` : ''}
        
        Navigation:
        - Include links to: ${pages.join(', ')}
        
        The footer should include:
        - Copyright information
        - Contact details
        - Social media links (if provided)
        - Quick navigation links
        
        Style Guidelines:
        - Primary Color: ${primaryColor}
        - Secondary Color: ${secondaryColor}
        - Font Family: ${fontFamily}
        - Font Style: ${fontStyle}
        
        Return a JSON object with 'content' (the HTML code) and 'css' (the CSS styling).
        Use Bootstrap 5 for the responsive design.
      `;
    }

    return prompt;
  }

  /**
   * Create a prompt for page generation
   * @param {string} pageName - Name of the page
   * @param {Object} websiteData - Website configuration
   * @param {Object} header - Header content and CSS
   * @param {Object} footer - Footer content and CSS
   * @returns {string} Formatted prompt
   */
  createPagePrompt(pageName, websiteData, header, footer) {
    const {
      businessName,
      businessCategory,
      businessDescription,
      websiteTitle,
      websiteTagline,
      websiteType,
      websitePurpose,
      primaryColor,
      secondaryColor,
      fontFamily,
      fontStyle,
      hasNewsletter,
      hasGoogleMap,
      googleMapUrl,
      hasImageSlider
    } = websiteData;

    // Create sections description based on page type
    let sectionsDescription = '';

    if (pageName === 'Home') {
      sectionsDescription = `
        1. Hero Section - With business name, tagline and a prominent call-to-action
        2. Introduction Section - Brief overview of the business
        3. Services/Features Section - Highlighting key offerings
        4. Testimonials Section - Customer reviews or testimonials
        5. Call to Action Section - Encouraging visitors to take action
      `;

      if (hasImageSlider) {
        sectionsDescription += '6. Image Slider - Showcasing products or services\n';
      }

      if (hasNewsletter) {
        sectionsDescription += '7. Newsletter Signup Section - To capture visitor emails\n';
      }
    } else if (pageName === 'About' || pageName === 'About Us') {
      sectionsDescription = `
        1. Company Story Section - The history and mission of the business
        2. Team Section - Information about the team or key people
        3. Values Section - Core values or principles
        4. Achievements Section - Key milestones or accomplishments
      `;
    } else if (pageName === 'Services') {
      sectionsDescription = `
        1. Services Overview Section - Introduction to services
        2. Service Detail Sections - Individual sections for each main service
        3. Process Section - How the service works
        4. Pricing Section - Service pricing or packages
        5. FAQ Section - Common questions about services
      `;
    } else if (pageName === 'Contact' || pageName === 'Contact Us') {
      sectionsDescription = `
        1. Contact Form Section - A form for visitors to submit inquiries
        2. Contact Information Section - Business address, phone, email
      `;

      if (hasGoogleMap) {
        sectionsDescription += `3. Map Section - Showing business location ${googleMapUrl ? `using this map URL: ${googleMapUrl}` : ''}\n`;
      }
    } else if (pageName === 'Blog') {
      sectionsDescription = `
        1. Blog Header Section - Introduction to the blog
        2. Featured Posts Section - Highlighted blog posts
        3. Recent Posts Section - Latest blog entries
        4. Categories Section - Blog categories
      `;
    } else {
      // Generic page sections
      sectionsDescription = `
        1. Page Header Section - Introduction to ${pageName}
        2. Main Content Section - Primary content for ${pageName}
        3. Additional Information Section - Supporting content
        4. Call to Action Section - Next steps for visitors
      `;
    }

    const prompt = `
      Create a responsive webpage for the "${pageName}" page of a website with the following details:
      
      Business Name: ${businessName}
      Business Category: ${businessCategory}
      Business Description: ${businessDescription}
      Website Title: ${websiteTitle}
      Website Tagline: ${websiteTagline}
      Website Type: ${websiteType}
      Website Purpose: ${websitePurpose}
      
      Style Guidelines:
      - Primary Color: ${primaryColor}
      - Secondary Color: ${secondaryColor}
      - Font Family: ${fontFamily}
      - Font Style: ${fontStyle}
      
      The ${pageName} page should include the following sections:
      ${sectionsDescription}
      
      For each section, create:
      1. Relevant and engaging content based on the business description
      2. Appropriate HTML structure using Bootstrap 5
      3. Custom CSS styling that matches the style guidelines
      
      Return a JSON object with a 'sections' array. Each section in the array should have:
      - 'sectionReference': A unique ID for the section (e.g., 'section-hero', 'section-services')
      - 'content': The HTML content for the section
      - 'css': The CSS styling for the section
      
      Make sure all content is properly responsive and looks good on all devices.
    `;

    return prompt;
  }
}

module.exports = new OllamaService();