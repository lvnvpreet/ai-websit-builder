/**
 * Service for processing and cleaning up generated content
 */
class ContentProcessor {
  /**
   * Process and clean up generated JSON content
   * @param {string} rawContent - Raw content from Ollama
   * @param {string} contentType - Type of content being processed ('page', 'header', 'footer')
   * @param {string} pageName - Name of the page if contentType is 'page'
   * @returns {Object|null} Processed content as JSON object
   */
  processJsonContent(rawContent, contentType = 'default', pageName = '') {
    try {
      // Log the first part of the content for debugging
      console.log("Processing content, first 100 chars:", rawContent?.substring(0, 100));

      // If already an object, return it
      if (typeof rawContent === 'object' && rawContent !== null) {
        return this._validateAndFixObject(rawContent, contentType, pageName);
      }

      // If we don't have valid content, return a fallback
      if (!rawContent || typeof rawContent !== 'string') {
        console.log("Invalid content type, using fallback");
        return this._createFallbackObject(contentType, pageName);
      }

      // Remove any <think> tags and their content before processing
      const cleanedContent = this._removeThinkTags(rawContent);
      console.log("After removing think tags, first 100 chars:", cleanedContent?.substring(0, 100));

      // Quick check for JSON validity
      const looksLikeJSON = cleanedContent.trim().startsWith('{') && cleanedContent.trim().includes('"');

      if (looksLikeJSON) {
        // For page content specifically - handle the pattern seen in logs where we have a sections array
        if (contentType === 'page' || cleanedContent.includes('"sections"')) {
          console.log(`Attempting to process ${pageName} page content with sections`);

          // Try to find the complete JSON object
          const result = this._extractAndParsePageJSON(cleanedContent, pageName);
          if (result) {
            console.log(`Successfully extracted ${result.sections?.length || 0} sections for ${pageName}`);
            return result;
          }
        }

        // For header/footer or fallback - try direct parsing with brace matching
        try {
          const startBrace = cleanedContent.indexOf('{');
          if (startBrace >= 0) {
            // Find the matching end brace using a proper brace counter
            const endBrace = this._findMatchingCloseBrace(cleanedContent, startBrace);
            if (endBrace > startBrace) {
              const jsonStr = cleanedContent.substring(startBrace, endBrace + 1);
              console.log(`Extracted JSON object (${jsonStr.length} chars)`);

              // Try to parse the JSON
              try {
                const parsed = JSON.parse(jsonStr);
                console.log("Successfully parsed JSON object");
                return this._validateAndFixObject(parsed, contentType, pageName);
              } catch (parseErr) {
                console.error("Error parsing JSON:", parseErr.message);
              }
            }
          }
        } catch (braceErr) {
          console.error("Brace matching error:", braceErr.message);
        }
      }

      // If we got here, try regex-based extraction as a last resort
      console.log("Trying regex-based extraction as last resort");

      // For header/footer, extract content and CSS properties
      if (contentType !== 'page') {
        const componentResult = this._extractComponentProperties(cleanedContent);
        if (componentResult) {
          console.log("Successfully extracted component properties");
          return componentResult;
        }
      }
      // For pages, try to extract sections array
      else {
        const pageResult = this._extractPageSections(cleanedContent, pageName);
        if (pageResult && pageResult.sections && pageResult.sections.length > 0) {
          console.log(`Extracted ${pageResult.sections.length} sections using regex`);
          return pageResult;
        }
      }

      // All extraction methods failed, use fallback
      console.log(`All extraction methods failed for ${contentType} ${pageName}, using fallback`);
      return this._createFallbackObject(contentType, pageName);
    } catch (error) {
      console.error('Error processing content:', error);
      return this._createFallbackObject(contentType, pageName);
    }
  }

  /**
   * Extract and parse complete JSON for a page with sections
   * @param {string} content - Cleaned content
   * @param {string} pageName - Name of the page
   * @returns {Object|null} - Parsed page object or null
   */
  _extractAndParsePageJSON(content, pageName) {
    try {
      // Clean up common JSON formatting issues before parsing
      content = content.replace(/\\n/g, '\\n')
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, '\\&')
        .replace(/\\r/g, '\\r')
        .replace(/\\t/g, '\\t')
        .replace(/\\b/g, '\\b')
        .replace(/\\f/g, '\\f');

      // Remove any non-printable characters
      content = content.replace(/[\u0000-\u001F]+/g, "");

      content = content.replace(/"([^"]+)"(\s*)(\w+):/g, '"$1"$2"$3":');  // Fix unquoted keys
      content = content.replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas
      // Approach 1: Try direct parsing of the whole content
      try {
        // Find valid JSON object start and end
        const startIdx = content.indexOf('{');
        if (startIdx >= 0) {
          // Find matching closing brace
          const endIdx = this._findMatchingCloseBrace(content, startIdx);
          if (endIdx > startIdx) {
            const jsonStr = content.substring(startIdx, endIdx + 1);

            // Last attempt to fix common issues before parsing
            const fixedJsonStr = this._fixCommonJsonErrors(jsonStr);

            try {
              const result = JSON.parse(fixedJsonStr);
              if (result && result.sections && Array.isArray(result.sections)) {
                return this._validateAndFixObject(result, 'page', pageName);
              }
            } catch (innerParseErr) {
              console.log("Inner JSON parsing failed:", innerParseErr.message);
            }
          }
        }
      } catch (directParseErr) {
        console.log("Direct parsing of page JSON failed:", directParseErr.message);
      }

      // Approach 2: Extract sections array and reconstruct JSON
      const sectionsMatch = content.match(/"sections"\s*:\s*\[([^[\]]*(?:\[(?:[^[\]]*(?:\[[^[\]]*\])*[^[\]]*)\])*[^[\]]*)\]/s);
      if (sectionsMatch && sectionsMatch[1]) {
        const sectionsArrayContent = sectionsMatch[1];

        // Try to manually build valid sections
        const sections = this._extractSectionsFromArray(sectionsArrayContent, pageName);

        if (sections && sections.length > 0) {
          return { sections };
        }
      }

      // Approach 3: Try block by block extraction
      const sectionBlocks = this._extractSectionBlocks(content);
      if (sectionBlocks && sectionBlocks.length > 0) {
        const sections = sectionBlocks.map((block, index) => {
          try {
            // Try to parse the block as JSON
            const parsed = JSON.parse(block);
            return {
              sectionReference: parsed.sectionReference || `section-${pageName.toLowerCase()}-${index}-${Date.now()}`,
              content: parsed.content || `<div>Section ${index + 1}</div>`,
              css: parsed.css || ''
            };
          } catch (blockErr) {
            // Extract properties using regex if parsing fails
            const refMatch = block.match(/"sectionReference"\s*:\s*"([^"]*)"/);
            const contentMatch = block.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
            const cssMatch = block.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);

            return {
              sectionReference: refMatch ? this._unescapeString(refMatch[1]) : `section-${pageName.toLowerCase()}-${index}-${Date.now()}`,
              content: contentMatch ? this._unescapeString(contentMatch[1]) : `<div>Section ${index + 1}</div>`,
              css: cssMatch ? this._unescapeString(cssMatch[1]) : ''
            };
          }
        });

        return { sections };
      }

      return null;
    } catch (error) {
      console.error("Error extracting page JSON:", error);
      return null;
    }
  }

  // Add this new helper method
  _fixCommonJsonErrors(jsonStr) {
    // Fix issues with unquoted property names
    let fixedStr = jsonStr.replace(/("[^"]*")([^,\}\]]*)("[a-zA-Z0-9_$]+")/g, '$1,$3');

    // Fix single quotes instead of double quotes
    fixedStr = fixedStr.replace(/'/g, '"');

    // Fix HTML in content property that might break JSON
    const contentMatches = fixedStr.match(/"content"\s*:\s*"(.*?)"/gs);
    if (contentMatches) {
      for (const match of contentMatches) {
        const cleanMatch = match.replace(/(<([^>]+)>)/gi, function (match) {
          return match.replace(/"/g, '\\"');
        });
        fixedStr = fixedStr.replace(match, cleanMatch);
      }
    }

    // Remove any trailing commas before closing brackets/braces
    fixedStr = fixedStr.replace(/,(\s*[\]}])/g, '$1');

    return fixedStr;
  }
  /**
   * Extract section blocks from content
   * @param {string} content - Content containing section objects
   * @returns {Array} - Array of section JSON strings
   */
  _extractSectionBlocks(content) {
    try {
      const blocks = [];
      let inObject = false;
      let objectStart = -1;
      let braceCount = 0;

      // Scan for section objects - looking for patterns like: { "sectionReference": ...
      for (let i = 0; i < content.length; i++) {
        // Start of potential object
        if (content[i] === '{') {
          if (!inObject) {
            // Check if it looks like a section object
            const nextChars = content.substring(i, i + 30);
            if (nextChars.includes('"sectionReference"') ||
              nextChars.includes('"content"') ||
              nextChars.includes('"css"')) {
              inObject = true;
              objectStart = i;
              braceCount = 1;
            } else {
              braceCount++;
            }
          } else {
            braceCount++;
          }
        }
        // End of object
        else if (content[i] === '}' && inObject) {
          braceCount--;
          if (braceCount === 0) {
            // Extract the complete object
            const objectStr = content.substring(objectStart, i + 1);
            blocks.push(objectStr);
            inObject = false;
          }
        }
      }

      return blocks;
    } catch (error) {
      console.log("Inner JSON parsing failed:", jsonError.message);

      // More aggressive repairs on syntax error
      if (jsonError.message.includes("Expected ',' or '}'")) {
        // Apply more aggressive fixes to the specific pattern
        let moreFixedJson = jsonStr.replace(/([^,{])\s*"([^"]+)":/g, '$1,"$2":');
        try {
          return JSON.parse(moreFixedJson);
        } catch (e) {
          // Still failed, continue to fallbacks
        }
      }
    }

  }

  /**
   * Extract sections from a sections array content
   * @param {string} arrayContent - Content of the sections array
   * @param {string} pageName - Name of the page
   * @returns {Array} - Array of section objects
   */
  _extractSectionsFromArray(arrayContent, pageName) {
    const sections = [];
    let currentSection = '';
    let braceLevel = 0;
    let inSection = false;

    // Process character by character
    for (let i = 0; i < arrayContent.length; i++) {
      const char = arrayContent[i];

      if (char === '{') {
        braceLevel++;
        if (braceLevel === 1) {
          inSection = true;
          currentSection = '{';
        } else if (inSection) {
          currentSection += char;
        }
      }
      else if (char === '}') {
        if (inSection) {
          currentSection += char;
        }
        braceLevel--;

        if (braceLevel === 0 && inSection) {
          // Found a complete section object
          try {
            const sectionObj = JSON.parse(currentSection);
            sections.push({
              sectionReference: sectionObj.sectionReference || `section-${pageName.toLowerCase()}-${sections.length}-${Date.now()}`,
              content: sectionObj.content || `<div>Section content</div>`,
              css: sectionObj.css || ''
            });
          } catch (err) {
            // If JSON parsing fails, try regex extraction
            console.error("Error parsing section:", err.message);
            const refMatch = currentSection.match(/"sectionReference"\s*:\s*"([^"]*)"/);
            const contentMatch = currentSection.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
            const cssMatch = currentSection.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);

            if (contentMatch || refMatch) {
              sections.push({
                sectionReference: refMatch ? this._unescapeString(refMatch[1]) : `section-${pageName.toLowerCase()}-${sections.length}-${Date.now()}`,
                content: contentMatch ? this._unescapeString(contentMatch[1]) : `<div>Section content</div>`,
                css: cssMatch ? this._unescapeString(cssMatch[1]) : ''
              });
            }
          }

          inSection = false;
          currentSection = '';
        }
      }
      else if (inSection) {
        currentSection += char;
      }
    }

    return sections;
  }

  /**
   * Extract component (header/footer) properties using regex
   * @param {string} content - Content to extract from
   * @returns {Object|null} - Extracted component properties or null
   */
  _extractComponentProperties(content) {
    // Extract content and CSS using regex
    const contentMatch = content.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
    const cssMatch = content.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);

    if (contentMatch || cssMatch) {
      return {
        content: contentMatch ? this._unescapeString(contentMatch[1]) : "<div>Fallback content</div>",
        css: cssMatch ? this._unescapeString(cssMatch[1]) : "/* Fallback CSS */"
      };
    }

    return null;
  }

  /**
   * Extract page sections using regex
   * @param {string} content - Content to extract from
   * @param {string} pageName - Name of the page
   * @returns {Object|null} - Page object with sections array or null
   */
  _extractPageSections(content, pageName) {
    // Try to find anything that looks like a section
    const sectionMatches = Array.from(content.matchAll(/\{[^{]*?"sectionReference"[^}]*?\}/g));
    const sections = [];

    for (const match of sectionMatches) {
      const sectionStr = match[0];

      try {
        // Try to parse the section as JSON
        const sectionObj = JSON.parse(sectionStr);
        sections.push({
          sectionReference: sectionObj.sectionReference || `section-${pageName.toLowerCase()}-${sections.length}-${Date.now()}`,
          content: sectionObj.content || `<div>Section content</div>`,
          css: sectionObj.css || ''
        });
      } catch (err) {
        // If JSON parsing fails, try regex extraction
        const refMatch = sectionStr.match(/"sectionReference"\s*:\s*"([^"]*)"/);
        const contentMatch = sectionStr.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
        const cssMatch = sectionStr.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);

        if (contentMatch || refMatch) {
          sections.push({
            sectionReference: refMatch ? this._unescapeString(refMatch[1]) : `section-${pageName.toLowerCase()}-${sections.length}-${Date.now()}`,
            content: contentMatch ? this._unescapeString(contentMatch[1]) : `<div>Section content</div>`,
            css: cssMatch ? this._unescapeString(cssMatch[1]) : ''
          });
        }
      }
    }

    if (sections.length > 0) {
      return { sections };
    }

    return null;
  }

  /**
   * Find the matching closing brace for a JSON object
   * @param {string} content - Content with JSON
   * @param {number} startIdx - Index of opening brace
   * @returns {number} - Index of closing brace or -1
   */
  _findMatchingCloseBrace(content, startIdx) {
    let braceCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = startIdx; i < content.length; i++) {
      const char = content[i];

      // Handle string content (skip processing braces inside strings)
      if (char === '"' && !escaped) {
        inString = !inString;
      }
      // Track escape character
      else if (char === '\\' && inString) {
        escaped = !escaped;
        continue;
      } else {
        escaped = false;
      }

      // Only process braces when not in a string
      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return i; // Found matching closing brace
          }
        }
      }
    }

    return -1; // No matching brace found
  }

  

  // Add a new method to detect and fix incomplete content
  async fixIncompleteContent(content, type, pageName) {
    // Detect incomplete HTML elements
    const incompleteTagsRegex = /<([a-z][a-z0-9]*)[^>]*?(?:href|src)=["'](?![^"']*["'])/gi;
    const incompleteClosingTagsRegex = /<([a-z][a-z0-9]*)[^>]*>[^<]*$/g;

    if (content.match(incompleteTagsRegex) || content.match(incompleteClosingTagsRegex)) {
      // Send back to AI for completion
      return await this._completeContentWithAI(content, type, pageName);
    }

    return content;
  }

  // Method to send incomplete content to AI for completion
  async _completeContentWithAI(incompleteContent, type, pageName) {
    try {
      // Import Ollama service
      const ollamaService = require('./ollamaService');

      // Create a prompt for fixing the content
      const fixPrompt = `
You are a professional web developer. I have HTML content that is incomplete or has errors.
Please fix the following issues and return ONLY the corrected HTML with no explanations:

1. Complete any truncated tags (like <a href=" with no closing quotes or tags)
2. Make sure all image tags have proper src attributes and closing tags or are self-closing
3. Ensure all links use valid URLs (use '#' for placeholder links)
4. Replace any references to 'home.html' with 'index.html'
5. Make sure there are no duplicate header tags

Here is the incomplete HTML:
\`\`\`html
${incompleteContent}
\`\`\`

Respond ONLY with the corrected HTML, without any explanations or markdown.
`;

      // Get the fixed content from Ollama
      const fixedContent = await ollamaService.generateText(fixPrompt, {
        temperature: 0.2, // Lower temperature for more precise fixes
        max_tokens: 4096
      });

      // Clean up the response (remove markdown code blocks if present)
      let cleanedContent = fixedContent.replace(/```html\s*|\s*```/g, '');

      // Final validation to ensure it's usable
      if (!cleanedContent || cleanedContent.length < 20) {
        console.warn("AI couldn't properly fix the content, using fallback");
        return this._createFallbackContent(type, pageName);
      }

      return cleanedContent;
    } catch (error) {
      console.error("Error while trying to fix content with AI:", error);
      return this._createFallbackContent(type, pageName);
    }
  }

  // Create appropriate fallback content based on type
  _createFallbackContent(type, pageName) {
    if (type === 'section') {
      return `<div class="container py-4">
      <h2>${pageName} Section</h2>
      <p>This section content couldn't be generated properly. Please edit this content.</p>
    </div>`;
    }
    // Add other fallback types as needed
    return '<div class="alert alert-warning">Content unavailable</div>';
  }

  // Now integrate this into your processJsonContent method
  async processJsonContent(rawContent, contentType = 'default', pageName = '') {
    try {
      // Your existing processing code...

      // Add this near the end of the method where you're about to return the result
      if (contentType === 'page' && result && result.sections) {
        // Process each section asynchronously
        const fixedSections = await Promise.all(
          result.sections.map(async (section) => {
            // Check and fix the content if needed
            section.content = await this.fixIncompleteContent(
              section.content,
              'section',
              pageName
            );
            return section;
          })
        );

        result.sections = fixedSections;
      } else if ((contentType === 'header' || contentType === 'footer') && result) {
        // Fix header/footer content
        result.content = await this.fixIncompleteContent(
          result.content,
          contentType,
          pageName
        );
      }

      return result;

    } catch (error) {
      console.error('Error processing content:', error);
      return this._createFallbackObject(contentType, pageName);
    }
  }

  /**
   * Validates and fixes a JSON object to ensure it has required properties
   * @param {Object} json - The JSON object to validate
   * @param {string} contentType - Type of content
   * @param {string} pageName - Name of page if contentType is 'page'
   * @returns {Object} Fixed JSON object
   */
  _validateAndFixObject(json, contentType, pageName) {
    if (!json) return this._createFallbackObject(contentType, pageName);

    if (contentType === 'page') {
      // For pages, ensure we have sections
      if (!json.sections || !Array.isArray(json.sections) || json.sections.length === 0) {
        return this._createFallbackObject('page', pageName);
      }

      // Validate each section and fix any issues
      json.sections = json.sections.map((section, index) => {
        // Handle missing or invalid content
        let content = section.content;
        if (!content || typeof content !== 'string') {
          content = `<div class="container"><h2>${pageName} Section ${index + 1}</h2><p>Content for ${pageName}</p></div>`;
        }

        // Handle missing or invalid CSS
        let css = section.css;
        if (!css || typeof css !== 'string') {
          css = `/* CSS for ${pageName} section ${index + 1} */`;
        }

        return {
          sectionReference: section.sectionReference || `section-${pageName.toLowerCase()}-${index}-${Date.now()}`,
          content: content,
          css: css
        };
      });

      return json;
    } else {
      // For header/footer, ensure we have content and CSS
      return {
        content: json.content || "<div>Fallback content</div>",
        css: json.css || "/* Fallback CSS */"
      };
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

    // Also remove any lines that start with <think and end with </think>
    cleaned = cleaned.replace(/^.*<think[\s\S]*?<\/think>.*$/gm, '');

    // Remove any partial think tags that might remain
    cleaned = cleaned.replace(/<think[^>]*>/g, '');
    cleaned = cleaned.replace(/<\/think>/g, '');

    // Remove markdown code blocks that might wrap JSON
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1');

    // If after removing think tags, the result starts with non-JSON content
    // Look for the first valid JSON start character
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
    if (!str) return '';

    try {
      // For deeply nested escaping (which might happen with JSON in JSON)
      let unescaped = str;

      // Multiple passes to handle nested escaping
      for (let i = 0; i < 3; i++) {
        // If there are no more escaped sequences, we're done
        if (!unescaped.includes('\\')) break;

        unescaped = unescaped
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r')
          .replace(/\\\\/g, '\\')
          .replace(/\\'/g, "'");
      }

      return unescaped;
    } catch (e) {
      console.error('Error unescaping string:', e);
      return str;
    }
  }

  /**
   * Create a fallback object when JSON parsing fails
   * @param {string} type - Type of content ('page', 'header', 'footer')
   * @param {string} pageName - Name of the page if type is 'page'
   * @returns {Object} A valid fallback object
   */
  _createFallbackObject(type = 'default', pageName = '') {
    // Page-specific fallbacks
    if (type === 'page') {
      if (pageName.toLowerCase() === 'home') {
        return {
          sections: [
            {
              sectionReference: `section-home-hero-${Date.now()}`,
              content: `
                <section class="hero bg-primary text-white py-5">
                  <div class="container">
                    <div class="row align-items-center">
                      <div class="col-lg-6">
                        <h1 class="display-4 fw-bold">Star Plumbers, NY</h1>
                        <p class="lead">Trusted Plumbing Experts in New York</p>
                        <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                          <button type="button" class="btn btn-light btn-lg px-4 me-md-2">Get a Quote</button>
                          <button type="button" class="btn btn-outline-light btn-lg px-4">Our Services</button>
                        </div>
                      </div>
                      <div class="col-lg-6">
                        <img src="https://via.placeholder.com/600x400" class="img-fluid rounded" alt="Hero Image">
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .hero {
                  background-color: #007bff;
                  padding: 80px 0;
                }
                .hero h1 {
                  font-size: 3.5rem;
                  margin-bottom: 1rem;
                }
                .hero .lead {
                  font-size: 1.5rem;
                  margin-bottom: 2rem;
                }
                @media (max-width: 768px) {
                  .hero h1 {
                    font-size: 2.5rem;
                  }
                }
              `
            },
            {
              sectionReference: `section-home-services-${Date.now()}`,
              content: `
                <section class="services py-5">
                  <div class="container">
                    <h2 class="text-center mb-5">Our Services</h2>
                    <div class="row g-4">
                      <div class="col-md-4">
                        <div class="card h-100">
                          <div class="card-body text-center">
                            <i class="fas fa-wrench text-primary mb-3" style="font-size: 2.5rem;"></i>
                            <h3 class="card-title h5">Emergency Repairs</h3>
                            <p class="card-text">24/7 emergency plumbing repairs to fix issues quickly and efficiently.</p>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="card h-100">
                          <div class="card-body text-center">
                            <i class="fas fa-shower text-primary mb-3" style="font-size: 2.5rem;"></i>
                            <h3 class="card-title h5">Fixture Installation</h3>
                            <p class="card-text">Professional installation of sinks, faucets, toilets and more.</p>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="card h-100">
                          <div class="card-body text-center">
                            <i class="fas fa-tint text-primary mb-3" style="font-size: 2.5rem;"></i>
                            <h3 class="card-title h5">Drain Cleaning</h3>
                            <p class="card-text">Effective drain cleaning services to prevent and clear clogs.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .services .card {
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                  border: none;
                  border-radius: 10px;
                  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .services .card:hover {
                  transform: translateY(-10px);
                  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
                }
              `
            },
            {
              sectionReference: `section-home-cta-${Date.now()}`,
              content: `
                <section class="cta py-5 bg-light">
                  <div class="container">
                    <div class="row justify-content-center">
                      <div class="col-lg-8 text-center">
                        <h2>Ready to Fix Your Plumbing Issues?</h2>
                        <p class="lead mb-4">Contact us today for a free estimate on your plumbing needs.</p>
                        <button type="button" class="btn btn-primary btn-lg px-5">Contact Us Now</button>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .cta {
                  background-color: #f8f9fa;
                  padding: 60px 0;
                }
                .cta h2 {
                  margin-bottom: 1rem;
                  color: #333;
                }
                .cta .btn {
                  transition: transform 0.3s ease;
                }
                .cta .btn:hover {
                  transform: scale(1.05);
                }
              `
            }
          ]
        };
      } else if (pageName.toLowerCase() === 'about') {
        return {
          sections: [
            {
              sectionReference: `section-about-header-${Date.now()}`,
              content: `
                <section class="about-header bg-light py-5">
                  <div class="container">
                    <div class="row justify-content-center">
                      <div class="col-lg-8 text-center">
                        <h1 class="display-5 fw-bold">About Star Plumbers, NY</h1>
                        <p class="lead">New York's most trusted plumbing service since 2005.</p>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .about-header {
                  padding: 60px 0;
                }
                .about-header h1 {
                  color: #007bff;
                }
              `
            },
            {
              sectionReference: `section-about-story-${Date.now()}`,
              content: `
                <section class="about-story py-5">
                  <div class="container">
                    <div class="row align-items-center">
                      <div class="col-lg-6 mb-4 mb-lg-0">
                        <img src="https://via.placeholder.com/600x400" class="img-fluid rounded" alt="Our Story">
                      </div>
                      <div class="col-lg-6">
                        <h2>Our Story</h2>
                        <p>Star Plumbers was founded in 2005 with a mission to provide the highest quality plumbing services to the New York area. We began as a small family business and have grown to become one of the most trusted names in plumbing throughout the city.</p>
                        <p>Our team consists of licensed professionals with decades of combined experience in the plumbing industry. We pride ourselves on our prompt service, quality workmanship, and transparent pricing.</p>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .about-story h2 {
                  color: #007bff;
                  margin-bottom: 1.5rem;
                }
                .about-story p {
                  margin-bottom: 1.5rem;
                  line-height: 1.7;
                }
              `
            }
          ]
        };
      } else if (pageName.toLowerCase() === 'services') {
        return {
          sections: [
            {
              sectionReference: `section-services-header-${Date.now()}`,
              content: `
                <section class="services-header bg-primary text-white py-5">
                  <div class="container">
                    <div class="row justify-content-center">
                      <div class="col-lg-8 text-center">
                        <h1 class="display-5 fw-bold">Our Services</h1>
                        <p class="lead">Comprehensive plumbing solutions for your home or business.</p>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .services-header {
                  padding: 60px 0;
                }
              `
            },
            {
              sectionReference: `section-services-list-${Date.now()}`,
              content: `
                <section class="services-list py-5">
                  <div class="container">
                    <div class="row g-4">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h3 class="card-title text-primary">Emergency Repairs</h3>
                            <p class="card-text">Our 24/7 emergency service ensures that we're always available when you need us most. We respond quickly to burst pipes, sewage backups, and other urgent plumbing issues.</p>
                            <ul class="list-unstyled">
                              <li><i class="fas fa-check text-success me-2"></i> Available 24/7</li>
                              <li><i class="fas fa-check text-success me-2"></i> Fast response times</li>
                              <li><i class="fas fa-check text-success me-2"></i> Fully equipped service vehicles</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-body">
                            <h3 class="card-title text-primary">Fixture Installation</h3>
                            <p class="card-text">We install all types of plumbing fixtures for bathrooms and kitchens, ensuring proper fit and function to prevent future issues.</p>
                            <ul class="list-unstyled">
                              <li><i class="fas fa-check text-success me-2"></i> Sinks and faucets</li>
                              <li><i class="fas fa-check text-success me-2"></i> Toilets and bidets</li>
                              <li><i class="fas fa-check text-success me-2"></i> Showers and bathtubs</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .services-list .card {
                  transition: transform 0.3s ease;
                  border-radius: 10px;
                }
                .services-list .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .services-list .card-title {
                  margin-bottom: 1rem;
                }
                .services-list li {
                  margin-bottom: 0.5rem;
                }
              `
            }
          ]
        };
      } else if (pageName.toLowerCase() === 'contact') {
        return {
          sections: [
            {
              sectionReference: `section-contact-header-${Date.now()}`,
              content: `
                <section class="contact-header bg-light py-5">
                  <div class="container">
                    <div class="row justify-content-center">
                      <div class="col-lg-8 text-center">
                        <h1 class="display-5 fw-bold">Contact Us</h1>
                        <p class="lead">Get in touch with our team for all your plumbing needs.</p>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .contact-header {
                  padding: 60px 0;
                }
                .contact-header h1 {
                  color: #007bff;
                }
              `
            },
            {
              sectionReference: `section-contact-form-${Date.now()}`,
              content: `
                <section class="contact-form py-5">
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-6 mb-4 mb-lg-0">
                        <h2>Send Us a Message</h2>
                        <form>
                          <div class="mb-3">
                            <label for="name" class="form-label">Your Name</label>
                            <input type="text" class="form-control" id="name" placeholder="John Smith">
                          </div>
                          <div class="mb-3">
                            <label for="email" class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="email" placeholder="john@example.com">
                          </div>
                          <div class="mb-3">
                            <label for="phone" class="form-label">Phone Number</label>
                            <input type="tel" class="form-control" id="phone" placeholder="(212) 555-1234">
                          </div>
                          <div class="mb-3">
                            <label for="message" class="form-label">Message</label>
                            <textarea class="form-control" id="message" rows="4" placeholder="Tell us about your plumbing needs..."></textarea>
                          </div>
                          <button type="submit" class="btn btn-primary">Send Message</button>
                        </form>
                      </div>
                      <div class="col-lg-6">
                        <h2>Contact Information</h2>
                        <p class="mb-4">We're available 24/7 for emergency services.</p>
                        <div class="d-flex mb-3">
                          <div class="me-3">
                            <i class="fas fa-map-marker-alt text-primary" style="font-size: 1.2rem;"></i>
                          </div>
                          <div>
                            <h4 class="h6">Address</h4>
                            <p class="mb-0">23 Main Street, Brooklyn, NY 11201</p>
                          </div>
                        </div>
                        <div class="d-flex mb-3">
                          <div class="me-3">
                            <i class="fas fa-phone text-primary" style="font-size: 1.2rem;"></i>
                          </div>
                          <div>
                            <h4 class="h6">Phone</h4>
                            <p class="mb-0">(212) 555-0134</p>
                          </div>
                        </div>
                        <div class="d-flex mb-3">
                          <div class="me-3">
                            <i class="fas fa-envelope text-primary" style="font-size: 1.2rem;"></i>
                          </div>
                          <div>
                            <h4 class="h6">Email</h4>
                            <p class="mb-0">contact@startplumbersny.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              `,
              css: `
                .contact-form h2 {
                  color: #007bff;
                  margin-bottom: 1.5rem;
                }
                .contact-form .form-control {
                  border-radius: 0.25rem;
                }
                .contact-form .form-control:focus {
                  border-color: #007bff;
                  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
                }
              `
            }
          ]
        };
      } else {
        // Generic page fallback
        return {
          sections: [{
            sectionReference: `section-fallback-${Date.now()}`,
            content: `
              <div class="fallback-section py-5">
                <div class="container">
                  <h2>${pageName} Content</h2>
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
    } else if (type === 'header') {
      // Header fallback with Bootstrap 5
      return {
        content: `
          <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
              <a class="navbar-brand" href="#">Star Plumbers, NY</a>
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                  <li class="nav-item">
                    <a class="nav-link active" href="#">Home</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">About</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Services</a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" href="#">Contact</a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        `,
        css: `
          .navbar-brand {
            font-weight: 700;
            font-size: 1.5rem;
          }
          .nav-link {
            padding: 0.5rem 1rem;
            transition: color 0.3s ease;
          }
          .nav-link:hover {
            color: rgba(255, 255, 255, 0.9) !important;
          }
          .nav-link.active {
            font-weight: 700;
          }
        `
      };
    } else if (type === 'footer') {
      // Footer fallback with Bootstrap 5
      return {
        content: `
          <footer class="bg-dark text-light py-5">
            <div class="container">
              <div class="row">
                <div class="col-md-4 mb-4">
                  <h5>Star Plumbers, NY</h5>
                  <p>Trusted Plumbing Experts in New York</p>
                </div>
                <div class="col-md-4 mb-4">
                  <h5>Quick Links</h5>
                  <ul class="list-unstyled">
                    <li><a href="#" class="text-light">Home</a></li>
                    <li><a href="#" class="text-light">About</a></li>
                    <li><a href="#" class="text-light">Services</a></li>
                    <li><a href="#" class="text-light">Contact</a></li>
                  </ul>
                </div>
                <div class="col-md-4 mb-4">
                  <h5>Contact Us</h5>
                  <address class="mb-0">
                    23 Main Street, Brooklyn, NY 11201<br>
                    Phone: (212) 555-0134<br>
                    Email: contact@startplumbersny.com
                  </address>
                </div>
              </div>
              <hr class="my-4 bg-light opacity-25">
              <div class="row">
                <div class="col-md-6">
                  <p class="mb-0">&copy; 2024 Star Plumbers, NY. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-md-end">
                  <div class="social-links">
                    <a href="#" class="text-light me-3"><i class="fab fa-facebook"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-light me-3"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="text-light"><i class="fab fa-linkedin"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        `,
        css: `
          footer {
            background-color: #212529;
          }
          footer h5 {
            margin-bottom: 1rem;
            font-weight: 600;
          }
          footer ul li {
            margin-bottom: 0.5rem;
          }
          footer a {
            text-decoration: none;
            transition: opacity 0.3s ease;
          }
          footer a:hover {
            opacity: 0.8;
          }
          .social-links {
            font-size: 1.25rem;
          }
          .social-links a {
            transition: transform 0.3s ease;
          }
          .social-links a:hover {
            transform: translateY(-3px);
          }
        `
      };
    }

    // Default fallback
    return {
      content: `
        <div class="fallback-content py-4">
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