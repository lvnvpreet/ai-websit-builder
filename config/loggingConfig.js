// Add to config/loggingConfig.js
module.exports = {
  level: process.env.LOG_LEVEL || 'info', // debug, info, warn, error
  format: 'text', // text, json
  
  // File logging
  fileLogging: true,
  logDirectory: './logs',
  
  // Error logging
  detailedErrors: true,
  stackTraces: true,
  
  // Content logging
  logGeneratedContent: process.env.NODE_ENV === 'development',
  contentLogDirectory: './logs/content'
};