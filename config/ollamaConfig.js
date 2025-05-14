module.exports = {
  serverUrl: process.env.OLLAMA_URL || 'http://175.111.130.242:11434',
  defaultModel: process.env.OLLAMA_MODEL || 'qwq:32b-preview-q8_0',
  defaultParams: {
    temperature: 0.7,
    max_tokens: 16000,  // Increased from 12000
    top_p: 0.9,
    stop: [],
    timeout: 360000,    // Increased to 6 minutes
    stream: false,
    options: {
      num_ctx: 16384,
      num_predict: 16000, // Increased
      num_thread: 8,
      repeat_penalty: 1.1,
      temperature: 0.7,
      top_k: 40,
      top_p: 0.9
    }
  },
  
  // Enhanced params for different generation types
  headerParams: {
    temperature: 0.5,    // More consistent for headers
    max_tokens: 6000,
    top_p: 0.8,
    timeout: 120000,     // 2 minutes
    options: {
      num_ctx: 8192,
      num_predict: 6000,
      temperature: 0.5,
      top_k: 30,
      top_p: 0.8
    }
  },
  
  footerParams: {
    temperature: 0.5,    // More consistent for footers
    max_tokens: 6000,
    top_p: 0.8,
    timeout: 120000,     // 2 minutes
    options: {
      num_ctx: 8192,
      num_predict: 6000,
      temperature: 0.5,
      top_k: 30,
      top_p: 0.8
    }
  },
  
  pageParams: {
    temperature: 0.6,    // Balanced for page content
    max_tokens: 15000,   // Higher for complete pages
    top_p: 0.9,
    timeout: 300000,     // 5 minutes for large pages
    options: {
      num_ctx: 20480,    // Larger context for complex pages
      num_predict: 15000,
      temperature: 0.6,
      top_k: 40,
      top_p: 0.9,
      repeat_penalty: 1.05
    }
  },
  
  jsonParams: {
    temperature: 0.1,    // Very low for JSON consistency
    max_tokens: 15000,   // High for complete JSON
    top_p: 0.7,
    timeout: 300000,     // 5 minutes
    stream: false,       // Never stream JSON
    format: 'json',      // Ollama specific format parameter
    options: {
      num_ctx: 16384,
      num_predict: 15000,
      temperature: 0.1,
      top_k: 10,
      top_p: 0.7,
      repeat_penalty: 1.0  // No penalty for JSON structure
    }
  },
  
  // Timeouts for different operations
  timeouts: {
    default: 360000,    // 6 minutes
    header: 180000,     // 3 minutes
    footer: 180000,     // 3 minutes
    page: 420000,       // 7 minutes
    json: 420000,       // 7 minutes
    complex: 600000,    // 10 minutes
    
    // Retry configuration
    retryDelay: 3000,   // 3 seconds
    maxRetries: 5       // Increased
  },
  
  // Retry configuration
  retry: {
    attempts: 7,        // Increased from 5
    initialDelay: 3000, // 3 seconds
    maxDelay: 45000,    // 45 seconds
    backoffMultiplier: 1.5
  },
  
  // Memory management
  memorySettings: {
    enableGC: true,      // Force garbage collection
    maxMemoryUsage: 4096, // 4GB limit
    checkInterval: 30000, // Check every 30 seconds
    warningThreshold: 0.8 // Warn at 80% usage
  },
  
  // Logging configuration
  logging: {
    level: 'info',       // debug, info, warn, error
    logTokenUsage: true,
    logGenerationTime: true,
    logErrors: true,
    logToFile: false,
    logFilePath: './logs/ollama.log'
  },
  
  // Development/testing settings
  development: {
    mockResponses: false, // Use mock responses for testing
    debugMode: false,     // Extra logging and validation
    saveGenerations: false, // Save all generations to files
    generationsPath: './debug/generations'
  },
  
  // Model-specific configurations
  modelConfigs: {
    'qwq:32b-preview-q8_0': {
      max_tokens: 16000,
      num_ctx: 32768,      // Large context window
      temperature: 0.7,
      top_p: 0.9,
      repeat_penalty: 1.1
    },
    'llama2': {
      max_tokens: 8000,
      num_ctx: 8192,
      temperature: 0.7,
      top_p: 0.95,
      repeat_penalty: 1.05
    },
    'codellama': {
      max_tokens: 12000,
      num_ctx: 16384,
      temperature: 0.2,    // Lower for code
      top_p: 0.95,
      repeat_penalty: 1.0  // No penalty for code
    }
  }
};