// services/themeCustomizationService.js
const Website = require('../models/Website');
const Page = require('../models/Page');
const fs = require('fs');
const path = require('path');

/**
 * Service for managing website theme customization
 */
class ThemeCustomizationService {
  constructor() {
    this.defaultThemes = {
      modern: {
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        fontHeadings: "'Montserrat', sans-serif",
        fontBody: "'Open Sans', sans-serif",
        borderRadius: '4px',
        spacing: 'normal',
        layoutType: 'standard'
      },
      minimal: {
        primary: '#212121',
        secondary: '#757575',
        accent: '#f44336',
        fontHeadings: "'Roboto', sans-serif",
        fontBody: "'Roboto', sans-serif",
        borderRadius: '2px',
        spacing: 'compact',
        layoutType: 'minimal'
      },
      elegant: {
        primary: '#9c27b0',
        secondary: '#673ab7',
        accent: '#ff9800',
        fontHeadings: "'Playfair Display', serif",
        fontBody: "'Lato', sans-serif",
        borderRadius: '8px',
        spacing: 'spacious',
        layoutType: 'centered'
      },
      corporate: {
        primary: '#0d47a1',
        secondary: '#546e7a',
        accent: '#fb8c00',
        fontHeadings: "'Raleway', sans-serif",
        fontBody: "'Source Sans Pro', sans-serif",
        borderRadius: '3px',
        spacing: 'normal',
        layoutType: 'wide'
      },
      creative: {
        primary: '#8e24aa',
        secondary: '#d81b60',
        accent: '#ffc107',
        fontHeadings: "'Abril Fatface', cursive",
        fontBody: "'Nunito', sans-serif",
        borderRadius: '10px',
        spacing: 'creative',
        layoutType: 'asymmetric'
      }
    };
    
    this.fontPairings = [
      { heading: "'Montserrat', sans-serif", body: "'Open Sans', sans-serif" },
      { heading: "'Playfair Display', serif", body: "'Source Sans Pro', sans-serif" },
      { heading: "'Oswald', sans-serif", body: "'Roboto', sans-serif" },
      { heading: "'Raleway', sans-serif", body: "'Lato', sans-serif" },
      { heading: "'Merriweather', serif", body: "'Work Sans', sans-serif" },
      { heading: "'Poppins', sans-serif", body: "'Nunito', sans-serif" },
      { heading: "'Abril Fatface', cursive", body: "'Nunito', sans-serif" },
      { heading: "'Archivo Black', sans-serif", body: "'Roboto', sans-serif" }
    ];
    
    this.layoutOptions = {
      standard: {
        containerWidth: '1140px',
        headerStyle: 'fixed',
        footerStyle: 'standard',
        sectionSpacing: '60px',
        contentWidth: '80%'
      },
      wide: {
        containerWidth: '1440px',
        headerStyle: 'fixed',
        footerStyle: 'wide',
        sectionSpacing: '50px', 
        contentWidth: '90%'
      },
      minimal: {
        containerWidth: '1040px',
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        sectionSpacing: '40px',
        contentWidth: '75%'
      },
      centered: {
        containerWidth: '1240px',
        headerStyle: 'centered',
        footerStyle: 'centered',
        sectionSpacing: '70px',
        contentWidth: '65%'
      },
      asymmetric: {
        containerWidth: '1340px',
        headerStyle: 'asymmetric',
        footerStyle: 'standard',
        sectionSpacing: '80px',
        contentWidth: '85%'
      }
    };
  }

  /**
   * Save theme customizations to a website
   * @param {String} websiteId - Website ID
   * @param {Object} customizations - Theme customization data
   * @returns {Promise<Object>} Updated website
   */
  async saveThemeCustomizations(websiteId, customizations) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    website.themeCustomizations = {
      ...website.themeCustomizations || {},
      ...customizations
    };
    
    await website.save();
    return website;
  }
  
  /**
   * Apply theme to website files
   * @param {String} websiteId - Website ID
   * @returns {Promise<Object>} Result status
   */
  async applyThemeToWebsite(websiteId) {
    const website = await Website.findById(websiteId);
    if (!website) throw new Error('Website not found');
    
    const customCSS = this.generateCustomCSS(website.themeCustomizations);
    
    // Save CSS to the website's export directory
    const cssPath = path.join('exports', websiteId, 'css', 'custom-theme.css');
    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
    fs.writeFileSync(cssPath, customCSS);
    
    // Update references in all HTML files
    this.updateHTMLFiles(websiteId);
    
    return { success: true, cssPath };
  }
  
  /**
   * Generate custom CSS from theme options
   * @param {Object} customizations - Theme customization data
   * @returns {String} Generated CSS
   */
  generateCustomCSS(customizations) {
    const theme = customizations || this.defaultThemes.modern;
    const layout = this.layoutOptions[theme.layoutType || 'standard'];
    
    return `
    :root {
      --primary-color: ${theme.primary || '#3498db'};
      --secondary-color: ${theme.secondary || '#2ecc71'};
      --accent-color: ${theme.accent || '#e74c3c'};
      --heading-font: ${theme.fontHeadings || "'Montserrat', sans-serif"};
      --body-font: ${theme.fontBody || "'Open Sans', sans-serif"};
      --border-radius: ${theme.borderRadius || '4px'};
      --container-width: ${layout.containerWidth};
      --content-width: ${layout.contentWidth};
      --section-spacing: ${layout.sectionSpacing};
    }
    
    body {
      font-family: var(--body-font);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--heading-font);
      color: var(--primary-color);
    }
    
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
      border-radius: var(--border-radius);
    }
    
    .btn-secondary {
      background-color: var(--secondary-color);
      border-color: var(--secondary-color);
      border-radius: var(--border-radius);
    }
    
    .accent {
      color: var(--accent-color);
    }
    
    .container {
      max-width: var(--container-width);
    }
    
    .content-container {
      width: var(--content-width);
      margin: 0 auto;
    }
    
    section {
      margin-bottom: var(--section-spacing);
    }
    
    /* Header styles based on layout type */
    ${this._generateHeaderCSS(theme.layoutType)}
    
    /* Footer styles based on layout type */
    ${this._generateFooterCSS(theme.layoutType)}
    
    /* Additional custom styles */
    ${theme.customCSS || ''}
    `;
  }
  
  /**
   * Generate header CSS based on layout type
   * @param {String} layoutType - Layout type
   * @returns {String} Generated CSS
   */
  _generateHeaderCSS(layoutType = 'standard') {
    const layouts = {
      standard: `
        header {
          position: fixed;
          width: 100%;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
      `,
      minimal: `
        header {
          position: static;
          width: 100%;
          background-color: transparent;
          padding: 20px 0;
        }
      `,
      centered: `
        header {
          position: fixed;
          width: 100%;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          text-align: center;
        }
        header .navbar-brand {
          float: none;
          display: inline-block;
        }
      `,
      asymmetric: `
        header {
          position: fixed;
          width: 100%;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          padding-left: 5%;
        }
      `,
      wide: `
        header {
          position: fixed;
          width: 100%;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }
        header .container {
          max-width: 90%;
        }
      `
    };
    
    return layouts[layoutType] || layouts.standard;
  }
  
  /**
   * Generate footer CSS based on layout type
   * @param {String} layoutType - Layout type
   * @returns {String} Generated CSS
   */
  _generateFooterCSS(layoutType = 'standard') {
    const layouts = {
      standard: `
        footer {
          background-color: #333;
          color: white;
          padding: 50px 0;
        }
      `,
      minimal: `
        footer {
          background-color: #f8f9fa;
          color: #333;
          padding: 30px 0;
          text-align: center;
        }
      `,
      centered: `
        footer {
          background-color: #333;
          color: white;
          padding: 50px 0;
          text-align: center;
        }
      `,
      wide: `
        footer {
          background-color: #333;
          color: white;
          padding: 50px 0;
        }
        footer .container {
          max-width: 90%;
        }
      `
    };
    
    return layouts[layoutType] || layouts.standard;
  }
  
  /**
   * Update HTML files with theme references
   * @param {String} websiteId - Website ID
   */
  updateHTMLFiles(websiteId) {
    const exportDir = path.join('exports', websiteId);
    const htmlFiles = this._findHtmlFiles(exportDir);
    
    for (const file of htmlFiles) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Add reference to custom CSS if not exists
      if (!content.includes('custom-theme.css')) {
        content = content.replace(
          '</head>',
          '  <link rel="stylesheet" href="/css/custom-theme.css">\n</head>'
        );
        fs.writeFileSync(file, content, 'utf8');
      }
    }
  }
  
  /**
   * Find all HTML files in directory
   * @param {String} dir - Directory to search
   * @param {Array} fileList - List to populate (used in recursion)
   * @returns {Array} List of HTML files
   */
  _findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this._findHtmlFiles(filePath, fileList);
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    }
    
    return fileList;
  }
  
  /**
   * Get available theme templates
   * @returns {Object} Theme templates
   */
  getThemeTemplates() {
    return this.defaultThemes;
  }
  
  /**
   * Get available font pairings
   * @returns {Array} Font pairings
   */
  getFontPairings() {
    return this.fontPairings;
  }
  
  /**
   * Get available layout options
   * @returns {Object} Layout options
   */
  getLayoutOptions() {
    return this.layoutOptions;
  }

  /**
   * Generate CSS from theme data
   * @param {Object} themeData - Theme customization data
   * @returns {String} Generated CSS
   */
  generateThemeCSS(themeData) {
    let css = `
      :root {
        --primary-color: ${themeData.primary || '#007bff'};
        --secondary-color: ${themeData.secondary || '#6c757d'};
        --accent-color: ${themeData.accent || '#e74c3c'};
        --text-color: ${themeData.textColor || '#333333'};
        --background-color: ${themeData.backgroundColor || '#ffffff'};
        --heading-font: ${themeData.headingFont || 'inherit'};
        --body-font: ${themeData.bodyFont || 'inherit'};
        --section-spacing: ${themeData.sectionSpacing || '2rem'};
        --element-spacing: ${themeData.elementSpacing || '1rem'};
        --border-radius: ${themeData.borderRadius || '0.25rem'};
      }
      
      /* Primary color elements */
      .btn-primary, .bg-primary, .nav-pills .nav-link.active, .badge-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      
      a, .text-primary {
        color: var(--primary-color) !important;
      }
      
      /* Secondary color elements */
      .btn-secondary, .bg-secondary, .badge-secondary {
        background-color: var(--secondary-color) !important;
        border-color: var(--secondary-color) !important;
      }
      
      /* Accent color elements */
      .btn-accent, .bg-accent, .badge-accent {
        background-color: var(--accent-color) !important;
        border-color: var(--accent-color) !important;
      }
      
      /* Text color */
      body, p, .text-body {
        color: var(--text-color) !important;
      }
      
      /* Background color */
      body, .bg-light {
        background-color: var(--background-color) !important;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6, .h1, .h2, .h3, .h4, .h5, .h6 {
        font-family: var(--heading-font) !important;
      }
      
      body, p, div, span, a, button, input, select, textarea {
        font-family: var(--body-font) !important;
      }
      
      /* Spacing */
      section, .section {
        margin-bottom: var(--section-spacing) !important;
      }
      
      .card, .form-group, .form-control, .btn, .alert {
        border-radius: var(--border-radius) !important;
      }
      
      /* Additional customizations based on layout type */
      ${themeData.layoutType === 'compact' ? `
        .container {
          max-width: 960px !important;
        }
        section, .section {
          padding: 2rem 0 !important;
        }
      ` : ''}
      
      ${themeData.layoutType === 'spacious' ? `
        .container {
          max-width: 1200px !important;
        }
        section, .section {
          padding: 4rem 0 !important;
        }
      ` : ''}
    `;
    
    return css;
  }
}

module.exports = new ThemeCustomizationService();
