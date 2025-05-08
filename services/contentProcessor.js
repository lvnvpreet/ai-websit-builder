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
      
      // Check for empty JSON object
      if (cleanedContent.trim() === '{}' || cleanedContent.trim().match(/^\{\s*\}$/)) {
        console.log("Empty JSON object detected, using specialized fallback");
        return this._createFallbackObject(contentType, pageName);
      }
      
      // Try direct JSON parsing first with enhanced error handling
      try {
        const parsedResult = this._attemptJsonParse(cleanedContent, contentType, pageName);
        if (parsedResult) {
          return parsedResult;
        }
      } catch (jsonError) {
        console.log("Direct JSON parsing failed:", jsonError.message);
      }
      
      // Fallback to regex extraction if direct parsing fails
      console.log("Direct JSON parsing failed, falling back to regex extraction");
      
      // For header/footer generation, extract content and CSS
      if (contentType !== 'page') {
        const contentMatch = cleanedContent.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
        const cssMatch = cleanedContent.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);
        
        if (contentMatch || cssMatch) {
          console.log("Found content or CSS match using regex");
          return {
            content: contentMatch ? this._unescapeString(contentMatch[1]) : "<div>Fallback content</div>",
            css: cssMatch ? this._unescapeString(cssMatch[1]) : "/* Fallback CSS */"
          };
        }
      }
      
      // For page generation, look for sections array
      const sectionsMatch = cleanedContent.match(/"sections"\s*:\s*\[([\s\S]*?)\]/);
      if (sectionsMatch) {
        console.log("Found sections match using regex");
        // Try to extract individual sections using regex
        const sectionsData = sectionsMatch[1];
        const sections = [];
        
        // Find all section objects
        const sectionRegex = /\{([\s\S]*?)\}/g;
        let sectionMatch;
        let sectionCount = 0;
        
        while ((sectionMatch = sectionRegex.exec(sectionsData)) !== null && sectionCount < 20) {
          const sectionContent = `{${sectionMatch[1]}}`;
          
          try {
            // Try to parse each section as JSON
            const sectionJson = JSON.parse(sectionContent);
            
            // Extract or create required properties
            const sectionRef = sectionJson.sectionReference || 
              `section-${pageName.toLowerCase()}-${sectionCount}-${Date.now()}`;
              
            sections.push({
              sectionReference: sectionRef,
              content: sectionJson.content || "<div>Section content</div>",
              css: sectionJson.css || "/* Section CSS */"
            });
            
          } catch (sectionParseError) {
            // If JSON parsing fails, try regex extraction
            const sectionRefMatch = sectionContent.match(/"sectionReference"\s*:\s*"((?:\\"|[^"])*?)"/);
            const contentMatch = sectionContent.match(/"content"\s*:\s*"((?:\\"|[^"])*?)"/);
            const cssMatch = sectionContent.match(/"css"\s*:\s*"((?:\\"|[^"])*?)"/);
            
            const sectionRef = sectionRefMatch ? 
              this._unescapeString(sectionRefMatch[1]) : 
              `section-${pageName.toLowerCase()}-${sectionCount}-${Date.now()}`;
              
            sections.push({
              sectionReference: sectionRef,
              content: contentMatch ? this._unescapeString(contentMatch[1]) : "<div>Section content</div>",
              css: cssMatch ? this._unescapeString(cssMatch[1]) : "/* Section CSS */"
            });
          }
          
          sectionCount++;
        }
        
        // If we couldn't extract any sections, add fallback sections based on page type
        if (sections.length === 0) {
          console.log(`No sections extracted for ${pageName} page, using fallback sections`);
          return this._createFallbackObject('page', pageName);
        } else {
          console.log(`Successfully extracted ${sections.length} sections for ${pageName} page`);
        }
        
        return { sections };
      }
      
      // If all extraction attempts fail, return a fallback specific to the page/component type
      console.log("All extraction methods failed, using specialized fallback for", contentType, pageName);
      return this._createFallbackObject(contentType, pageName);
    } catch (error) {
      console.error('Error processing content:', error);
      return this._createFallbackObject(contentType, pageName);
    }
  }
  
  /**
   * Attempts to parse JSON with multiple strategies
   * @param {string} content - JSON string to parse
   * @param {string} contentType - Type of content
   * @param {string} pageName - Name of page if contentType is 'page'
   * @returns {Object|null} Parsed JSON or null
   */
  _attemptJsonParse(content, contentType, pageName) {
    // Try direct parsing first
    try {
      const parsedJson = JSON.parse(content);
      // Validate and fix the parsed JSON
      return this._validateAndFixObject(parsedJson, contentType, pageName);
    } catch (directError) {
      // Direct parsing failed, try to fix common issues
    }
    
    // Try extracting JSON from between braces
    try {
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      
      if (startIdx >= 0 && endIdx > startIdx) {
        const jsonString = content.substring(startIdx, endIdx + 1);
        const parsedJson = JSON.parse(jsonString);
        return this._validateAndFixObject(parsedJson, contentType, pageName);
      }
    } catch (subsetError) {
      // Subset parsing failed
    }
    
    // Try extracting JSON from markdown code blocks
    try {
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        const codeJson = JSON.parse(codeBlockMatch[1].trim());
        return this._validateAndFixObject(codeJson, contentType, pageName);
      }
    } catch (codeBlockError) {
      // Code block parsing failed
    }
    
    return null;
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
      
      // Validate each section
      json.sections = json.sections.map((section, index) => {
        return {
          sectionReference: section.sectionReference || `section-${pageName.toLowerCase()}-${index}-${Date.now()}`,
          content: section.content || `<div class="container"><h2>${pageName} Section</h2><p>Content for ${pageName}</p></div>`,
          css: section.css || `/* CSS for ${pageName} section ${index} */`
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
    
    // If after removing think tags, the result starts with non-JSON content
    // Look for the first opening curly brace
    const jsonStartIdx = cleaned.indexOf('{');
    const jsonArrayStartIdx = cleaned.indexOf('[');
    
    // If we have both { and [, take the first one
    if (jsonStartIdx >= 0 && jsonArrayStartIdx >= 0) {
      const firstJsonDelimiter = Math.min(jsonStartIdx, jsonArrayStartIdx);
      if (firstJsonDelimiter > 0) {
        cleaned = cleaned.substring(firstJsonDelimiter);
      }
    } 
    // If we only have {
    else if (jsonStartIdx > 0) {
      cleaned = cleaned.substring(jsonStartIdx);
    } 
    // If we only have [
    else if (jsonArrayStartIdx > 0) {
      cleaned = cleaned.substring(jsonArrayStartIdx);
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
      // Handle common escape sequences
      return str
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\\/g, '\\')
        .replace(/\\'/g, "'");
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