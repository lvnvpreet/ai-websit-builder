// Configuration for the AI service
module.exports = {  // The default AI provider to use
  provider: process.env.AI_PROVIDER || 'openrouter', // 'ollama' or 'openrouter'
  
  // Provider-specific configurations
  providers: {
    ollama: {
      // These settings are imported from ollamaConfig.js
      configPath: '../config/ollamaConfig'
    },
    openrouter: {
      // These settings are imported from openRouterConfig.js
      configPath: '../config/openRouterConfig'
    }
  },
  
  // Default generation parameters (will be overridden by provider-specific settings)
  generation: {
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    retry: {
      attempts: 3,
      initialDelay: 1000,
      maxDelay: 5000
    }
  }
};
