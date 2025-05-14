// services/loggingService.js
const fs = require('fs');
const path = require('path');
const config = require('../config/loggingConfig');

class LoggingService {
  constructor() {
    this.initialize();
  }
  
  initialize() {
    // Create log directories if they don't exist
    if (config.fileLogging) {
      if (!fs.existsSync(config.logDirectory)) {
        fs.mkdirSync(config.logDirectory, { recursive: true });
      }
      
      if (config.logGeneratedContent && !fs.existsSync(config.contentLogDirectory)) {
        fs.mkdirSync(config.contentLogDirectory, { recursive: true });
      }
    }
  }
  
  /**
   * Log a message with a given level
   * @param {string} level - Log level (debug, info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  log(level, message, data = {}) {
    // Skip if level is below configured level
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] < levels[config.level]) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };
    
    // Console logging
    if (level === 'error') {
      console.error(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
      if (config.detailedErrors && data.error) {
        console.error(data.error);
      }
    } else {
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    }
    
    // File logging
    if (config.fileLogging) {
      this._writeToLogFile(level, logEntry);
    }
  }
  
  /**
   * Log debug message
   * @param {string} message - Message
   * @param {Object} data - Additional data
   */
  debug(message, data = {}) {
    this.log('debug', message, data);
  }
  
  /**
   * Log info message
   * @param {string} message - Message
   * @param {Object} data - Additional data
   */
  info(message, data = {}) {
    this.log('info', message, data);
  }
  
  /**
   * Log warning message
   * @param {string} message - Message
   * @param {Object} data - Additional data
   */
  warn(message, data = {}) {
    this.log('warn', message, data);
  }
  
  /**
   * Log error message
   * @param {string} message - Message
   * @param {Object} data - Additional data
   */
  error(message, error) {
    this.log('error', message, { error });
  }
  
  /**
   * Log generated content
   * @param {string} type - Content type
   * @param {string} content - Content to log
   * @param {string} id - Website or page ID
   */
  logContent(type, content, id) {
    if (!config.logGeneratedContent) {
      return;
    }
    
    const filename = `${type}_${id}_${Date.now()}.txt`;
    const filePath = path.join(config.contentLogDirectory, filename);
    
    fs.writeFileSync(filePath, content);
    this.debug(`Logged ${type} content to ${filename}`);
  }
  
  /**
   * Write log entry to file
   * @param {string} level - Log level
   * @param {Object} entry - Log entry
   */
  _writeToLogFile(level, entry) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(config.logDirectory, `${level}_${date}.log`);
    
    const logLine = config.format === 'json' 
      ? JSON.stringify(entry) 
      : `[${entry.timestamp}] ${entry.message}`;
    
    fs.appendFileSync(logFile, logLine + '\n');
  }
}

module.exports = new LoggingService();