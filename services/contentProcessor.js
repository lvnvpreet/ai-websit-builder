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
        // If already an object, return it
        if (typeof rawContent === 'object') {
          return rawContent;
        }
        
        // Extract JSON from the raw content
        const jsonContent = this.extractJsonFromText(rawContent);
        
        // Parse JSON
        return JSON.parse(jsonContent);
      } catch (error) {
        console.error('Error processing JSON content:', error);
        
        // Try to fix common JSON parsing issues
        try {
          const fixedJson = this.fixJsonSyntax(rawContent);
          return JSON.parse(fixedJson);
        } catch (fixError) {
          console.error('Failed to fix JSON syntax:', fixError);
          return null;
        }
      }
    }
    
    /**
     * Extract JSON from text that might contain markdown or explanations
     * @param {string} text - Text to extract JSON from
     * @returns {string} Extracted JSON string
     */
    extractJsonFromText(text) {
      if (!text) return '{}';
      
      let jsonContent = text.trim();
      
      // Look for JSON content between triple backticks
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)```/;
      const jsonMatch = jsonContent.match(jsonRegex);
      
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1].trim();
      } else {
        // Check for array pattern if this is expected to be an array
        const arrayMatch = jsonContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          jsonContent = arrayMatch[0].trim();
        } else {
          // If no array, look for content between curly braces
          const curlyBraceMatch = jsonContent.match(/\{[\s\S]*\}/);
          if (curlyBraceMatch) {
            jsonContent = curlyBraceMatch[0].trim();
          }
        }
      }
      
      // Remove any markdown formatting
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.substring(7);
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.substring(3);
      }
      
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.substring(0, jsonContent.length - 3);
      }
      
      return jsonContent.trim();
    }
    
    /**
     * Fix common JSON syntax issues
     * @param {string} jsonStr - JSON string to fix
     * @returns {string} Fixed JSON string
     */
    fixJsonSyntax(jsonStr) {
      if (!jsonStr) return '{}';
      
      // Extract JSON from text
      let fixed = this.extractJsonFromText(jsonStr);
      
      // Replace single quotes with double quotes
      fixed = fixed.replace(/'/g, '"');
      
      // Add quotes to unquoted keys
      fixed = fixed.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      
      // Fix trailing commas in objects and arrays
      fixed = fixed.replace(/,\s*([\]}])/g, '$1');
      
      // Fix missing commas between objects in arrays
      fixed = fixed.replace(/}\s*{/g, '},{');
      
      // Check for proper opening/closing structure
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      
      if (openBraces > closeBraces) {
        fixed = fixed + '}'.repeat(openBraces - closeBraces);
      }
      
      if (openBrackets > closeBrackets) {
        fixed = fixed + ']'.repeat(openBrackets - closeBrackets);
      }
      
      return fixed;
    }
    
    /**
     * Clean and optimize HTML content
     * @param {string} htmlContent - HTML content to clean
     * @returns {string} Cleaned HTML content
     */
    cleanHtmlContent(htmlContent) {
      if (!htmlContent) return '';
      
      // Remove extra whitespace
      let cleaned = htmlContent.replace(/\s+/g, ' ');
      
      // Remove HTML comments
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
      
      // Remove script tags and their content
      cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      // Ensure proper formatting of void elements (e.g., <img>, <br>)
      cleaned = cleaned.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)>/gi, 
        (match, tag, attrs) => {
          // Ensure there's a space before the closing if there are attributes
          if (attrs && !attrs.endsWith(' ')) {
            attrs = attrs + ' ';
          }
          return `<${tag}${attrs}>`;
        }
      );
      
      return cleaned.trim();
    }
    
    /**
     * Clean and optimize CSS content
     * @param {string} cssContent - CSS content to clean
     * @param {string} sectionId - Section ID to scope CSS to
     * @returns {string} Cleaned CSS content
     */
    cleanCssContent(cssContent, sectionId) {
      if (!cssContent) return '';
      
      // Remove extra whitespace
      let cleaned = cssContent.replace(/\s+/g, ' ');
      
      // Remove CSS comments
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Make sure CSS selectors are properly scoped to the section ID
      if (sectionId) {
        // Split into rule sets
        const ruleSets = cleaned.split('}');
        
        // Process each rule set
        const processedRuleSets = ruleSets.map(ruleSet => {
          if (!ruleSet.trim()) return '';
          
          const [selectors, declarations] = ruleSet.split('{');
          
          // Process each selector
          const selectorList = selectors.split(',');
          const processedSelectors = selectorList.map(selector => {
            selector = selector.trim();
            
            // Skip if empty or already has the section ID
            if (!selector || selector.includes(`#${sectionId}`)) {
              return selector;
            }
            
            // Add the section ID as a parent selector
            return `#${sectionId} ${selector}`;
          }).join(', ');
          
          return `${processedSelectors} {${declarations}`;
        });
        
        // Join rule sets back together
        cleaned = processedRuleSets.join('}');
        if (cleaned && !cleaned.endsWith('}')) {
          cleaned += '}';
        }
      }
      
      return cleaned.trim();
    }
    
    /**
     * Process the full website data structure
     * @param {Object} websiteData - Raw website data structure
     * @returns {Object} Processed website data structure
     */
    processWebsiteData(websiteData) {
      const processed = {
        header: null,
        footer: null,
        pages: []
      };
      
      // Process header
      if (websiteData.header) {
        processed.header = {
          content: this.cleanHtmlContent(websiteData.header.content),
          css: this.cleanCssContent(websiteData.header.css)
        };
      }
      
      // Process footer
      if (websiteData.footer) {
        processed.footer = {
          content: this.cleanHtmlContent(websiteData.footer.content),
          css: this.cleanCssContent(websiteData.footer.css)
        };
      }
      
      // Process pages
      if (Array.isArray(websiteData.pages)) {
        processed.pages = websiteData.pages.map(page => {
          const processedPage = {
            name: page.name,
            slug: page.slug,
            content: []
          };
          
          // Process page sections
          if (Array.isArray(page.content)) {
            processedPage.content = page.content.map(section => {
              return {
                sectionReference: section.sectionReference,
                content: this.cleanHtmlContent(section.content),
                css: this.cleanCssContent(section.css, section.sectionReference)
              };
            });
          }
          
          return processedPage;
        });
      }
      
      return processed;
    }
  }
  
  module.exports = new ContentProcessor();