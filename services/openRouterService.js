const axios = require('axios');
const config = require('../config/openRouterConfig');

class OpenRouterService {
  constructor() {
    try {
      this.baseUrl = config?.baseUrl || process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1';
      this.model = config?.defaultModel || process.env.OPENROUTER_MODEL || 'gpt-3.5-turbo';
      this.apiKey = process.env.OPENROUTER_API_KEY || config?.apiKey || '';
      this.defaultParams = config?.defaultParams || {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stop: []
      };
      
      this.siteInfo = config?.siteInfo || {
        name: 'AI Website Builder',
        website: 'https://aiwebsitebuilder.com'
      };
      
      // Add cache for API usage tracking
      this.usageCache = {
        lastReset: new Date(),
        requestCount: 0,
        quotaExceeded: false,
        quotaResetTime: null,
        remainingTokens: null
      };

      // Log initialization details for debugging
      console.log('OpenRouterService initialized with:');
      console.log(`- baseUrl: ${this.baseUrl}`);
      console.log(`- model: ${this.model}`);
    } catch (error) {
      console.error('Error initializing OpenRouterService:', error);
      // Set fallback values if initialization fails
      this.baseUrl = 'https://openrouter.ai/api/v1';
      this.model = 'gpt-3.5-turbo';
      this.apiKey = '';
      this.defaultParams = {
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
        stop: []
      };
    }
  }

  /**
   * Reset usage tracking if it's a new day
   */
  _checkAndResetUsage() {
    const now = new Date();
    const lastResetDate = this.usageCache.lastReset;
    
    // Reset usage stats if it's a new day
    if (now.getDate() !== lastResetDate.getDate() || 
        now.getMonth() !== lastResetDate.getMonth() ||
        now.getFullYear() !== lastResetDate.getFullYear()) {
      this.usageCache = {
        lastReset: now,
        requestCount: 0,
        quotaExceeded: false,
        quotaResetTime: null,
        remainingTokens: null
      };
      console.log('OpenRouter usage tracking reset for new day');
    }
  }
  
  /**
   * Update API usage information based on API response headers
   * @param {Object} headers - Response headers from OpenRouter API
   */
  _updateUsageFromHeaders(headers) {
    if (headers['x-ratelimit-remaining']) {
      this.usageCache.remainingTokens = parseInt(headers['x-ratelimit-remaining']);
    }
    
    if (headers['x-ratelimit-reset']) {
      const resetTime = parseInt(headers['x-ratelimit-reset']);
      this.usageCache.quotaResetTime = new Date(resetTime * 1000);
    }
    
    // Increment request counter
    this.usageCache.requestCount++;
    
    // Log usage info
    if (this.usageCache.remainingTokens !== null) {
      console.log(`OpenRouter API usage: ${this.usageCache.requestCount} requests today, ${this.usageCache.remainingTokens} tokens remaining`);
    }
  }

  /**
   * Check if the quota has been exceeded
   * @returns {boolean} True if quota is exceeded
   */
  isQuotaExceeded() {
    this._checkAndResetUsage();
    return this.usageCache.quotaExceeded;
  }
  
  /**
   * Get quota status information
   * @returns {Object} Quota status info
   */
  getQuotaStatus() {
    this._checkAndResetUsage();
    return {
      exceeded: this.usageCache.quotaExceeded,
      resetTime: this.usageCache.quotaResetTime,
      remainingTokens: this.usageCache.remainingTokens,
      requestCount: this.usageCache.requestCount
    };
  }

  /**
   * Check if the Open Router API is accessible
   * @returns {Promise<boolean>} True if API is accessible
   */
  async isServerRunning() {
    if (!this.apiKey) {
      console.log('Open Router API key not configured');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error checking Open Router API access:', error.message);
      return false;
    }
  }

  /**
   * Set the model to be used for generation
   * @param {string} model - Model identifier
   */
  setModel(model) {
    this.model = model;
    console.log(`Open Router model set to: ${model}`);
  }

  /**
   * Get list of available models from Open Router
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      if (!this.apiKey) {
        throw new Error('Open Router API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteInfo.website,
          'X-Title': this.siteInfo.name
        }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data.map(model => ({
          id: model.id,
          name: model.name || model.id,
          description: model.description || '',
          pricing: model.pricing || {},
          context_length: model.context_length || 4096
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching available models from Open Router:', error.message);
      return [];
    }
  }

  /**
   * Generate text using the Open Router API
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} params - Generation parameters (optional)
   * @returns {Promise<string>} Generated text
   */  async generateText(prompt, params = {}) {
    // Check if we've already exceeded the quota
    this._checkAndResetUsage();
    if (this.usageCache.quotaExceeded) {
      const resetTime = this.usageCache.quotaResetTime 
        ? this.usageCache.quotaResetTime.toLocaleString() 
        : 'unknown time';
      throw new Error(`Open Router API quota exceeded. Quota will reset at ${resetTime}.`);
    }
    
    try {
      if (!this.apiKey) {
        throw new Error('Open Router API key not configured');
      }

      const mergedParams = { ...this.defaultParams, ...params };
      
      const requestData = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that specializes in website creation. You generate clean, professional HTML, CSS, and JavaScript code for websites. Your responses are accurate, well-structured, and follow best practices in web development."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: mergedParams.temperature,
        max_tokens: mergedParams.max_tokens,
        top_p: mergedParams.top_p,
        stream: false
      };

      if (mergedParams.stop && mergedParams.stop.length > 0) {
        requestData.stop = mergedParams.stop;
      }

      if (params.format && params.format === "json") {
        requestData.response_format = { type: "json_object" };
      }
      
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteInfo.website,
        'X-Title': this.siteInfo.name
      };

      console.log(`Sending request to Open Router API with model: ${this.model}`);
      const response = await axios.post(`${this.baseUrl}/chat/completions`, requestData, { headers });
      
      this._updateUsageFromHeaders(response.headers);
      
      if (response.data && 
          response.data.choices && 
          response.data.choices.length > 0 &&
          response.data.choices[0].message) {
        return response.data.choices[0].message.content;
      }
      
      throw new Error('Unexpected response structure from Open Router API');    } catch (error) {
      console.error('Error generating text with Open Router:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        // Handle rate limiting and quota errors
        if (error.response.status === 429) {
          this.usageCache.quotaExceeded = true;
          
          // Extract reset time if available in headers
          if (error.response.headers && error.response.headers['x-ratelimit-reset']) {
            const resetTime = parseInt(error.response.headers['x-ratelimit-reset']);
            this.usageCache.quotaResetTime = new Date(resetTime * 1000);
          } else {
            // Default to 1 hour from now if no reset time provided
            const resetTime = new Date();
            resetTime.setHours(resetTime.getHours() + 1);
            this.usageCache.quotaResetTime = resetTime;
          }
          
          const resetTimeStr = this.usageCache.quotaResetTime.toLocaleString();
          throw new Error(`Open Router API quota exceeded. Quota will reset at ${resetTimeStr}.`);
        }
      }
      throw error;
    }
  }
}

module.exports = new OpenRouterService();
