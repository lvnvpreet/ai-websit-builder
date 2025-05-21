const ollamaService = require('./ollamaService');
const openRouterService = require('./openRouterService');

/**
 * A unified service for AI text generation that can use either Ollama or Open Router
 */
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'ollama'; // default to ollama
    console.log(`AI Service initialized with provider: ${this.provider}`);
  }
  /**
   * Set the AI provider to use
   * @param {string} provider - The provider to use ('ollama' or 'openrouter')
   */
  setProvider(provider) {
    if (provider !== 'ollama' && provider !== 'openrouter') {
      console.warn(`Invalid provider: ${provider}. Must be 'ollama' or 'openrouter'. Defaulting to 'ollama'`);
      this.provider = 'ollama';
    } else {
      this.provider = provider;
    }
    console.log(`AI provider set to: ${this.provider}`);
  }
  
  /**
   * Get the current AI provider
   * @returns {string} The current provider ('ollama' or 'openrouter')
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Get the current AI service based on the provider setting
   * @returns The appropriate service (ollama or openrouter)
   */
  getService() {
    return this.provider === 'openrouter' ? openRouterService : ollamaService;
  }

  /**
   * Check if the selected AI service is accessible
   * @returns {Promise<boolean>} True if the service is running
   */
  async isServiceRunning() {
    return this.getService().isServerRunning();
  }
  
  /**
   * Set the model to use for generation
   * @param {string} model - Model name/ID
   */
  setModel(model) {
    this.getService().setModel(model);
  }
  
  /**
   * Get available models from the selected provider
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      return await this.getService().getAvailableModels();
    } catch (error) {
      console.error(`Error getting models from ${this.provider}:`, error);
      return [];
    }
  }

  /**
   * Generate text using the selected AI provider
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} params - Generation parameters
   * @returns {Promise<string>} Generated text
   */
  async generateText(prompt, params = {}) {
    return this.getService().generateText(prompt, params);
  }
}

module.exports = new AIService();
