const axios = require('axios');
const config = require('../config/ollamaConfig');

class OllamaService {
  constructor() {
    try {
      this.baseUrl = config?.serverUrl || process.env.OLLAMA_URL || 'http://175.111.130.242:11434';
      this.model = config?.defaultModel || process.env.OLLAMA_MODEL || 'qwq:32b-preview-q8_0';
      this.defaultParams = {
        ...config?.defaultParams || {
          temperature: 0.7,
          max_tokens: 12000,
          top_p: 0.9,
          stop: [],
          timeout: 180000,
          options: {
            num_ctx: 16384,
            num_predict: 12000,
            num_thread: 8,
            repeat_penalty: 1.1,
            temperature: 0.7,
            top_k: 40,
            top_p: 0.9
          }
        }
      };

      // Initialize logging
      this.logging = config?.logging || {
        level: 'info',
        logTokenUsage: true,
        logGenerationTime: true,
        logErrors: true
      };

      // Initialize retry configuration
      this.retryConfig = config?.retry || {
        attempts: 5,
        initialDelay: 2000,
        maxDelay: 30000,
        backoffMultiplier: 2
      };

      // Initialize memory monitoring
      this.memorySettings = config?.memorySettings || {
        enableGC: true,
        maxMemoryUsage: 4096,
        checkInterval: 30000,
        warningThreshold: 0.8
      };

      // Start memory monitoring if enabled
      if (this.memorySettings.enableGC) {
        this.startMemoryMonitoring();
      }

      // Log initialization details
      console.log('OllamaService initialized with:');
      console.log(`- baseUrl: ${this.baseUrl}`);
      console.log(`- model: ${this.model}`);
      console.log(`- max_tokens: ${this.defaultParams.max_tokens}`);
      console.log(`- num_ctx: ${this.defaultParams.options?.num_ctx}`);
    } catch (error) {
      console.error('Error initializing OllamaService:', error);
      this.setFallbackValues();
    }
  }

  setFallbackValues() {
    this.baseUrl = 'http://175.111.130.242:11434';
    this.model = 'qwq:32b-preview-q8_0';
    this.defaultParams = {
      temperature: 0.7,
      max_tokens: 12000,
      top_p: 0.9,
      stop: [],
      timeout: 180000,
      options: {
        num_ctx: 16384,
        num_predict: 12000,
        num_thread: 8,
        repeat_penalty: 1.1,
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9
      }
    };
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    setInterval(() => {
      const used = process.memoryUsage();
      const heapUsedMB = used.heapUsed / 1024 / 1024;
      const heapTotalMB = used.heapTotal / 1024 / 1024;
      const memoryUsagePercent = (heapUsedMB / heapTotalMB);

      if (memoryUsagePercent > this.memorySettings.warningThreshold) {
        console.warn(`High memory usage detected: ${Math.round(memoryUsagePercent * 100)}%`);
        
        if (global.gc) {
          console.log('Running garbage collection...');
          global.gc();
        }
      }

      // Log memory usage periodically
      if (this.logging.level === 'debug') {
        console.log(`Memory usage: ${Math.round(heapUsedMB)} MB / ${Math.round(heapTotalMB)} MB (${Math.round(memoryUsagePercent * 100)}%)`);
      }
    }, this.memorySettings.checkInterval);
  }

  /**
   * Check if the Ollama server is accessible and the model is available
   * @param {string} serverUrl - Optional custom server URL
   * @returns {Promise<boolean>} True if server is running
   */
  async isServerRunning(serverUrl = null) {
    try {
      const url = serverUrl || this.baseUrl;
      const cleanUrl = url.replace(/\/$/, '');
      const apiUrl = `${cleanUrl}/api/tags`;

      console.log(`Checking Ollama server at: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        timeout: 10000
      });

      if (response.status === 200) {
        console.log('Ollama server is running');
        
        const models = response.data.models || [];
        const modelExists = models.some(model => model.name === this.model);

        if (!modelExists) {
          console.warn(`Model "${this.model}" not found on the Ollama server`);
          console.log('Available models:', models.map(m => m.name).join(', '));
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
      const url = serverUrl || this.baseUrl;
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
   * Generate text with Ollama with retry logic
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, params = {}) {
    const startTime = Date.now();
    
    try {
      // Determine content type for appropriate parameters
      const contentType = this.determineContentType(prompt, params);
      
      // Get configuration for content type
      const typeConfig = this.getConfigForType(contentType);
      
      // Merge parameters with type-specific configuration
      const requestParams = {
        ...typeConfig,
        ...params
      };

      // Log generation start
      if (this.logging.logGenerationTime) {
        console.log(`Starting generation (${contentType}):`, {
          model: this.model,
          max_tokens: requestParams.max_tokens,
          timeout: requestParams.timeout
        });
      }

      // Prepare prompt with instructions for better completion
      let modifiedPrompt = this.preparePrompt(prompt, contentType);

      // Execute generation with retry
      const response = await this.executeWithRetry(async () => {
        return axios.post(`${this.baseUrl}/api/generate`, {
          model: this.model,
          prompt: modifiedPrompt,
          stream: false,
          options: requestParams.options || {},
          ...requestParams
        }, {
          timeout: requestParams.timeout || 300000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
      }, this.retryConfig.attempts);

      // Log generation completion
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (this.logging.logTokenUsage || this.logging.logGenerationTime) {
        console.log(`Generation completed (${contentType}):`, {
          duration: `${duration}ms`,
          responseLength: `${response.data.response?.length || 0} chars`,
          estimatedTokens: Math.round((response.data.response?.length || 0) / 4)
        });
      }

      // Check for incomplete content and handle it
      const resultText = response.data.response || '';
      
      if (this.isContentIncomplete(resultText, contentType)) {
        console.warn('Content appears incomplete, attempting completion...');
        return await this.completeContent(resultText, prompt, params);
      }

      return resultText;
    } catch (error) {
      console.error('Error generating text with Ollama:', error.message);
      
      if (this.logging.logErrors) {
        console.error('Full error details:', {
          message: error.message,
          url: `${this.baseUrl}/api/generate`,
          model: this.model,
          params: params
        });
      }

      throw error;
    }
  }

  /**
   * Determine content type for appropriate configuration
   * @param {string} prompt - The prompt
   * @param {Object} params - Parameters
   * @returns {string} Content type
   */
  determineContentType(prompt, params) {
    if (prompt.includes('header') || prompt.includes('navigation')) return 'header';
    if (prompt.includes('footer')) return 'footer';
    if (prompt.includes('JSON') || prompt.includes('json') || params.format === 'json') return 'json';
    if (prompt.includes('page') || prompt.includes('section')) return 'page';
    return 'default';
  }

  /**
   * Get configuration for specific content type
   * @param {string} type - Content type
   * @returns {Object} Configuration
   */
  getConfigForType(type) {
    const configs = {
      header: config.headerParams || this.defaultParams,
      footer: config.footerParams || this.defaultParams,
      page: config.pageParams || this.defaultParams,
      json: config.jsonParams || this.defaultParams,
      default: this.defaultParams
    };

    return configs[type] || this.defaultParams;
  }

  /**
   * Prepare prompt with instructions for better completion
   * @param {string} prompt - Original prompt
   * @param {string} type - Content type
   * @returns {string} Modified prompt
   */
  preparePrompt(prompt, type) {
    let instructions = '';

    switch (type) {
      case 'json':
        instructions = `\n\nIMPORTANT: You must provide a complete, valid JSON response. Do not truncate the JSON. Ensure all brackets, braces, and quotes are properly closed. Do not include any text outside the JSON object.`;
        break;
      case 'page':
        instructions = `\n\nIMPORTANT: Provide complete HTML content. Ensure all HTML tags are properly closed. Include complete CSS with all necessary styles. Do not truncate any part of the response.`;
        break;
      default:
        instructions = `\n\nIMPORTANT: Provide complete and fully detailed content. Do not truncate or summarize. Include all necessary details and ensure proper structure completion.`;
    }

    return prompt + instructions;
  }

  /**
   * Check if content appears incomplete
   * @param {string} content - Generated content
   * @param {string} type - Content type
   * @returns {boolean} Whether content appears incomplete
   */
  isContentIncomplete(content, type) {
    if (!content) return true;

    if (type === 'json') {
      try {
        JSON.parse(content);
        return false;
      } catch (e) {
        // Check for unclosed brackets
        return content.includes('{') && !content.includes('}');
      }
    }

    if (type === 'page' || type === 'header' || type === 'footer') {
      // Check for unclosed HTML tags
      const openTags = (content.match(/<[^/>][^>]*>/g) || []).length;
      const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
      
      // Consider content incomplete if there are significantly more open tags than close tags
      return openTags - closeTags > 2;
    }

    // General incompleteness check
    const lastLines = content.trim().split('\n').slice(-3);
    const lastContent = lastLines.join('\n');
    
    // Check for common truncation patterns
    const truncationPatterns = [
      /\.\.\.$/, // ends with ...
      /<[^>]*$/, // open HTML tag at end
      /"[^"]*$/, // unclosed quote at end
      /\{[^}]*$/, // unclosed brace at end
      /\[[^\]]*$/, // unclosed bracket at end
    ];

    return truncationPatterns.some(pattern => pattern.test(lastContent));
  }

  /**
   * Attempt to complete incomplete content
   * @param {string} incompleteContent - The incomplete content
   * @param {string} originalPrompt - Original prompt
   * @param {Object} params - Generation parameters
   * @returns {Promise<string>} Completed content
   */
  async completeContent(incompleteContent, originalPrompt, params) {
    try {
      const completionPrompt = `Complete the following content. Continue exactly where it left off. Do not repeat any of the existing content, just provide the completion:

Previous content:
${incompleteContent}

IMPORTANT: Only provide the completion. Do not include any of the previous content. Start exactly where the content cut off.`;

      const completion = await this.generateText(completionPrompt, {
        ...params,
        max_tokens: Math.floor(params.max_tokens * 0.3) // Use 30% of tokens for completion
      });

      return incompleteContent + completion;
    } catch (error) {
      console.error('Error completing content:', error);
      return incompleteContent;
    }
  }

  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {number} maxAttempts - Maximum retry attempts
   * @returns {Promise<*>} Result of function execution
   */
  async executeWithRetry(fn, maxAttempts = this.retryConfig.attempts) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }

        // Calculate backoff delay
        const delay = Math.min(
          this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelay
        );

        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Generate JSON response with better error handling
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Generated JSON object
   */
  async generateJson(prompt, params = {}) {
    try {
      // Enhance the JSON instructions with explicit formatting guidance
      const jsonPrompt = `${prompt}

CRITICAL JSON FORMATTING INSTRUCTIONS:
1. Your response must be a valid JSON object ONLY
2. Do not include anything outside the JSON object
3. Do not include any markdown formatting or code blocks
4. Use double quotes for all property names and string values
5. Properly escape any quotes or special characters in strings
6. Do not use comments or explanations in the JSON
7. Ensure all brackets and braces are properly closed

Format your response exactly like this JSON structure with proper nesting and complete closure of all elements.`;

      // Set more appropriate parameters for JSON generation
      const jsonParams = {
        ...params,
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: params.max_tokens || 15000,
        format: 'json',
        options: {
          ...params.options,
          temperature: 0.1,
          top_k: 10,
          repeat_penalty: 1.0
        }
      };

      // Generate the response
      const response = await this.generateText(jsonPrompt, jsonParams);

      // Process the response using ContentProcessor
      const contentProcessor = require('./contentProcessor');
      return contentProcessor.processJsonContent(response, 'json');
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
   * Generate content in chunks for very large outputs
   * @param {string} prompt - The prompt to send
   * @param {Object} params - Additional parameters
   * @param {number} maxChunks - Maximum number of chunks
   * @returns {Promise<string>} Combined generated content
   */
  async generateInChunks(prompt, params = {}, maxChunks = 5) {
    const chunkSize = Math.floor((params.max_tokens || this.defaultParams.max_tokens) * 0.8);
    const chunks = [];
    let previousContent = '';

    try {
      for (let i = 0; i < maxChunks; i++) {
        const chunkPrompt = i === 0 
          ? prompt 
          : `${prompt}

Previous content:
${previousContent}

Continue from where the previous content ended. Do not repeat any of the previous content.
Part ${i + 1} of ${maxChunks}:`;

        const chunk = await this.generateText(chunkPrompt, {
          ...params,
          max_tokens: chunkSize
        });

        if (!chunk.trim()) {
          console.log(`No more content in chunk ${i + 1}, stopping...`);
          break;
        }

        chunks.push(chunk);
        previousContent += chunk;

        // Check if content appears complete
        if (!this.isContentIncomplete(chunk, this.determineContentType(prompt, params))) {
          console.log(`Content appears complete after chunk ${i + 1}`);
          break;
        }
      }

      return chunks.join('');
    } catch (error) {
      console.error('Error in chunked generation:', error);
      return chunks.join('') || 'Error generating chunked content';
    }
  }

  /**
   * Generate a website component with appropriate configuration
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
      prompt = `Create a responsive header for a website with the following details:
        
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
Use Bootstrap 5 for the responsive design.`;
    } else if (component === 'footer') {
      prompt = `Create a responsive footer for a website with the following details:
        
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
Use Bootstrap 5 for the responsive design.`;
    }

    return prompt;
  }
}

module.exports = new OllamaService();