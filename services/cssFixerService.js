// services/cssFixerService.js
const fs = require('fs');
const path = require('path');

class CssFixerService {
  /**
   * Fix missing CSS selectors in the exported files
   * @param {string} outputDir - Directory containing exported files
   */
  async fixCssSelectors(outputDir) {
    try {
      // Get all CSS files
      const cssFiles = await this._getCssFiles(outputDir);
      
      for (const file of cssFiles) {
        // Read file content
        const cssContent = fs.readFileSync(file, 'utf8');
        
        // Fix selectors
        const fixedContent = this._fixSelectors(cssContent, path.basename(file, '.css'));
        
        // Write fixed content
        fs.writeFileSync(file, fixedContent, 'utf8');
        
        console.log(`Fixed CSS selectors in ${file}`);
      }
    } catch (error) {
      console.error('Error fixing CSS selectors:', error);
    }
  }
  
  /**
   * Get all CSS files in the directory
   * @param {string} dir - Directory path
   * @returns {Promise<Array<string>>} - Array of file paths
   */
  async _getCssFiles(dir) {
    const cssDir = path.join(dir, 'css');
    if (!fs.existsSync(cssDir)) return [];
    
    return fs.readdirSync(cssDir)
      .filter(file => file.endsWith('.css'))
      .map(file => path.join(cssDir, file));
  }
  
  /**
   * Fix CSS selectors in content
   * @param {string} content - CSS content
   * @param {string} filename - CSS filename (without extension)
   * @returns {string} - Fixed CSS content
   */
  _fixSelectors(content, filename) {
    const lines = content.split('\n');
    let fixedLines = [];
    
    // Define common CSS selector patterns
    const selectorPattern = /^([a-zA-Z-]+)(\s+\{)/;
    
    for (const line of lines) {
      const match = line.match(selectorPattern);
      
      if (match && !line.trim().startsWith('/*') && !line.trim().startsWith('*/')) {
        // Found a selector without a class or ID prefix
        const selector = match[1];
        const restOfLine = match[2];
        
        // Add a class prefix to the selector
        fixedLines.push(`.${selector}${restOfLine}`);
      } else {
        fixedLines.push(line);
      }
    }
    
    return fixedLines.join('\n');
  }
}

module.exports = new CssFixerService();