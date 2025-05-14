// services/htmlFixerService.js
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

class HtmlFixerService {
  /**
   * Fix common HTML issues in the generated content
   * @param {string} html - Original HTML content
   * @returns {string} - Fixed HTML content
   */
  fixHtmlIssues(html) {
    try {
      // If HTML is empty or not a string, return as is
      if (!html || typeof html !== 'string') {
        return html;
      }
      
      // First try to fix common issues with regex
      let fixedHtml = this._fixCommonIssues(html);
      
      // Then try to parse and fix with DOM
      try {
        const dom = new JSDOM(fixedHtml);
        const document = dom.window.document;
        
        // Fix unclosed tags
        this._fixUnclosedTags(document);
        
        // Fix image tags
        this._fixImageTags(document);
        
        // Fix href attributes
        this._fixHrefAttributes(document);
        
        // Get the fixed HTML
        fixedHtml = dom.serialize();
      } catch (domError) {
        console.warn('DOM parsing failed, falling back to regex fixes only', domError);
      }
      
      return fixedHtml;
    } catch (error) {
      console.error('Error fixing HTML:', error);
      return html;
    }
  }
  
  /**
   * Fix common issues with regex
   * @param {string} html - HTML content
   * @returns {string} - Fixed HTML content
   */
  _fixCommonIssues(html) {
    // Fix unclosed tags
    html = html.replace(/<([a-z]+)([^>]*)>\s*(?![\s\S]*?<\/\1>)/g, '<$1$2></$1>');
    
    // Fix image tags that end abruptly
    html = html.replace(/<img src="(?![^"]*">)/g, '<img src="https://via.placeholder.com/800x400" alt="Placeholder"');
    
    // Fix href attributes that end abruptly
    html = html.replace(/<a href="(?![^"]*">)/g, '<a href="#"');
    
    // Fix broken navbar items
    html = html.replace(/<li class="nav-item(?![^>]*>)/g, '<li class="nav-item">');
    
    // Close unclosed list items
    html = html.replace(/<li([^>]*)>([^<]*?)(?!<\/li>)(<li|<\/ul>|<\/ol>)/g, '<li$1>$2</li>$3');
    
    // Fix broken div closures for navbar
    if (html.includes('<div class="collapse navbar-collapse"') && 
        !html.includes('</div></div>')) {
      html = html.replace(/<div class="collapse navbar-collapse"([^>]*)>([^<]*?)<ul/g, 
        '<div class="collapse navbar-collapse"$1>$2<ul');
      
      // Add closing divs if still missing
      if (!html.includes('</div></div>')) {
        const index = html.indexOf('<div class="collapse navbar-collapse"');
        if (index !== -1) {
          // Find where to insert closing tags
          const afterNavbar = html.indexOf('</header>', index);
          if (afterNavbar !== -1) {
            html = html.substring(0, afterNavbar) + '</div></div>' + html.substring(afterNavbar);
          }
        }
      }
    }
    
    return html;
  }
  
  /**
   * Fix unclosed tags in DOM
   * @param {Document} document - JSDOM document
   */
  _fixUnclosedTags(document) {
    // This is just a placeholder - JSDOM actually auto-fixes unclosed tags when parsing
  }
  
  /**
   * Fix image tags in DOM
   * @param {Document} document - JSDOM document
   */
  _fixImageTags(document) {
    const images = document.querySelectorAll('img[src=""]');
    images.forEach(img => {
      img.setAttribute('src', 'https://via.placeholder.com/800x400');
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'Placeholder Image');
      }
    });
  }
  
  /**
   * Fix href attributes in DOM
   * @param {Document} document - JSDOM document
   */
  _fixHrefAttributes(document) {
    const links = document.querySelectorAll('a[href=""]');
    links.forEach(link => {
      link.setAttribute('href', '#');
    });
  }
}

module.exports = new HtmlFixerService();