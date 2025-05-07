/**
 * Service for processing and cleaning up generated content
 */
class ContentProcessor {
  /**
   * Process and clean up generated JSON content
   * @param {string} rawContent - Raw content from Ollama
   * @returns {Object|null} Processed content as JSON object
   */
  processJsonContent(rawContent) {
    try {
      // Log the first part of the content for debugging
      console.log("Processing content, first 100 chars:", rawContent?.substring(0, 100));
      
      // If already an object, return it
      if (typeof rawContent === 'object' && rawContent !== null) {
        return rawContent;
      }
      
      // If we don't have valid content, return a fallback
      if (!rawContent || typeof rawContent !== 'string') {
        console.log("Invalid content type, using fallback");
        return this._createFallbackObject();
      }
      
      // Remove any <think> tags and their content before processing
      const cleanedContent = this._removeThinkTags(rawContent);
      
      // INSTEAD OF PARSING JSON, we'll use regex to extract the parts we need
      // This approach is more forgiving than JSON.parse
      
      // For header/footer generation, extract content and CSS
      const contentMatch = cleanedContent.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
      const cssMatch = cleanedContent.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);
      
      if (contentMatch || cssMatch) {
        return {
          content: contentMatch ? this._unescapeString(contentMatch[1]) : "<div>Fallback content</div>",
          css: cssMatch ? this._unescapeString(cssMatch[1]) : "/* Fallback CSS */"
        };
      }
      
      // For page generation, look for sections array
      const sectionsMatch = cleanedContent.match(/"sections"\s*:\s*\[([\s\S]*?)\]/);
      if (sectionsMatch) {
        // Try to extract individual sections using regex
        const sectionsData = sectionsMatch[1];
        const sections = [];
        
        // Find all section objects
        const sectionRegex = /\{([\s\S]*?)\}/g;
        let sectionMatch;
        let sectionCount = 0;
        
        while ((sectionMatch = sectionRegex.exec(sectionsData)) !== null && sectionCount < 10) {
          const sectionContent = sectionMatch[1];
          
          // Extract section properties
          const sectionRefMatch = sectionContent.match(/"sectionReference"\s*:\s*"((?:\\"|[^"])*?)"/);
          const contentMatch = sectionContent.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
          const cssMatch = sectionContent.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);
          
          const sectionRef = sectionRefMatch ? 
            this._unescapeString(sectionRefMatch[1]) : 
            `section-${sectionCount}-${Date.now()}`;
            
          sections.push({
            sectionReference: sectionRef,
            content: contentMatch ? this._unescapeString(contentMatch[1]) : "<div>Section content</div>",
            css: cssMatch ? this._unescapeString(cssMatch[1]) : "/* Section CSS */"
          });
          
          sectionCount++;
        }
        
        // If we couldn't extract any sections, add a fallback
        if (sections.length === 0) {
          sections.push({
            sectionReference: `section-fallback-${Date.now()}`,
            content: "<div class='fallback-section'>Fallback section content</div>",
            css: ".fallback-section { padding: 20px; border: 1px solid #eee; }"
          });
        }
        
        return { sections };
      }
      
      // If the content might be a valid JSON object despite our regex not matching
      // Try direct JSON parsing as a last resort
      try {
        // Find the first opening curly brace
        const jsonStartIdx = cleanedContent.indexOf('{');
        if (jsonStartIdx >= 0) {
          const potentialJson = cleanedContent.substring(jsonStartIdx);
          return JSON.parse(potentialJson);
        }
      } catch (jsonError) {
        console.log("Direct JSON parsing failed, using fallback");
      }
      
      // If we can't extract content reliably, return a fallback
      return this._createFallbackObject();
    } catch (error) {
      console.error('Error processing content:', error);
      return this._createFallbackObject();
    }
  }
  
  /**
   * Remove <think> tags and their content from the raw input
   * @param {string} content - Raw content that may contain think tags
   * @returns {string} Cleaned content without think tags
   */
  _removeThinkTags(content) {
    if (!content) return '';
    
    // Remove <think> tags and all content between them
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // If after removing think tags, the result starts with non-JSON content
    // Find the first opening curly brace
    const jsonStartIdx = cleaned.indexOf('{');
    if (jsonStartIdx > 0) {
      cleaned = cleaned.substring(jsonStartIdx);
    }
    
    return cleaned.trim();
  }
  
  /**
   * Unescape a JSON string value
   * @param {string} str - The escaped string
   * @returns {string} Unescaped string
   */
  _unescapeString(str) {
    try {
      // Handle common escape sequences
      return str
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\');
    } catch (e) {
      return str;
    }
  }
  
  /**
   * Create a fallback object when JSON parsing fails
   * @returns {Object} A valid fallback object
   */
  _createFallbackObject(type = 'default') {
    if (type === 'page') {
      return {
        sections: [{
          sectionReference: `section-fallback-${Date.now()}`,
          content: `
            <div class="fallback-section">
              <div class="container">
                <h2>Section Content</h2>
                <p>This is fallback content generated when the original content could not be processed.</p>
              </div>
            </div>
          `,
          css: `
            .fallback-section {
              padding: 40px 0;
              background-color: #f8f9fa;
            }
            .fallback-section h2 {
              margin-bottom: 20px;
              color: #333;
            }
          `
        }]
      };
    }
    
    // Default fallback (header/footer)
    return {
      content: `
        <div class="fallback-content">
          <div class="container">
            <p>Fallback content</p>
          </div>
        </div>
      `,
      css: `
        .fallback-content {
          padding: 20px 0;
          background-color: #f8f9fa;
        }
      `
    };
  }
  
  /**
   * Clean and optimize HTML content
   * @param {string} htmlContent - HTML content to clean
   * @returns {string} Cleaned HTML content
   */
  cleanHtmlContent(htmlContent) {
    if (!htmlContent) return '';
    
    try {
      // Remove extra whitespace
      let cleaned = htmlContent.replace(/\s+/g, ' ');
      
      // Remove HTML comments
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
      
      // Remove script tags and their content
      cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      return cleaned.trim();
    } catch (error) {
      console.error('Error cleaning HTML:', error);
      return htmlContent || '';
    }
  }
  
  /**
   * Clean and optimize CSS content
   * @param {string} cssContent - CSS content to clean
   * @param {string} sectionId - Section ID to scope CSS to
   * @returns {string} Cleaned CSS content
   */
  cleanCssContent(cssContent, sectionId) {
    if (!cssContent) return '';
    
    try {
      // Remove extra whitespace
      let cleaned = cssContent.replace(/\s+/g, ' ');
      
      // Remove CSS comments
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      
      return cleaned.trim();
    } catch (error) {
      console.error('Error cleaning CSS:', error);
      return cssContent || '';
    }
  }
}

module.exports = new ContentProcessor();