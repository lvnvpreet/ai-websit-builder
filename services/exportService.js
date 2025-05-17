const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Generate a website export
 * @param {Object} website - Website data from database
 * @param {Array} pages - Pages data from database
 * @param {String} format - Export format (html, static, development)
 * @returns {Promise<Buffer>} - ZIP file buffer
 */
exports.generateExport = async (website, pages, format = 'static') => {
  return new Promise((resolve, reject) => {
    try {
      // Create a file buffer to store the ZIP data
      const fileBuffers = [];

      // Create a ZIP archive
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Listen for all archive data to be written
      archive.on('data', (chunk) => fileBuffers.push(chunk));

      // Listen for archive warnings
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Archive warning:', err);
        } else {
          reject(err);
        }
      });

      // Listen for archive errors
      archive.on('error', (err) => reject(err));

      // Finalize the archive when all data has been added
      archive.on('end', () => {
        const buffer = Buffer.concat(fileBuffers);
        resolve(buffer);
      });

      // Set up base file structure based on export format
      if (format === 'html') {
        // Simple HTML-only export
        addHtmlOnlyFiles(archive, website, pages);
      } else if (format === 'development') {
        // Development-ready export with source files
        addDevelopmentFiles(archive, website, pages);
      } else {
        // Default: static website export
        addStaticFiles(archive, website, pages);
      }

      // Finalize the archive
      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Add HTML-only files to archive
 * @param {Object} archive - Archiver instance
 * @param {Object} website - Website data
 * @param {Array} pages - Pages data
 */
function addHtmlOnlyFiles(archive, website, pages) {
  // Create README file
  const readmeContent = `# ${website.businessName}

## Website Overview
${website.businessDescription}

## Generated Files
This export contains simple HTML files for your website.

## Pages
${pages.map(page => `- ${page.slug === '/' ? 'index' : page.slug}.html - ${page.name}`).join('\n')}

## Generated on
${new Date().toLocaleDateString()}
`;

  archive.append(readmeContent, { name: 'README.md' });

  // Process each page
  pages.forEach(page => {
    const filename = page.slug === '/' ? 'index.html' : `${page.slug}.html`;
    const content = generatePageHtml(website, page, pages);

    archive.append(content, { name: filename });
  });
}

/**
 * Add static website files to archive (HTML + CSS + JS)
 * @param {Object} archive - Archiver instance
 * @param {Object} website - Website data
 * @param {Array} pages - Pages data
 */
function addStaticFiles(archive, website, pages) {
  // Create directory structure
  archive.append(null, { name: 'css/' });
  archive.append(null, { name: 'js/' });
  archive.append(null, { name: 'images/' });
  archive.append(null, { name: 'images/search/' });


  // Copy images from your search images folder
  const searchImagesDir = path.join(__dirname, '../public/images/search');
  if (fs.existsSync(searchImagesDir)) {
    const files = fs.readdirSync(searchImagesDir);
    files.forEach(file => {
      const filePath = path.join(searchImagesDir, file);
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: `images/search/${file}` });
      }
    });
  }

  // Add image attribution CSS
  const attributionCss = `
/* Image attribution styles */
.image-attribution {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
  text-align: right;
}

.image-attribution a {
  color: #666;
  text-decoration: underline;
}

.image-attribution a:hover {
  color: #333;
}`;

archive.append(attributionCss, { name: 'css/attribution.css' });

let attributionDoc = `# Image Attributions\n\nThis website uses images from various sources that require attribution:\n\n`;

pages.forEach(page => {
  page.sections.forEach(section => {
    if (section.images && section.images.length > 0) {
      section.images.forEach(image => {
        attributionDoc += `## ${page.name} - ${image.alt || 'Image'}\n`;
        attributionDoc += `- Source: ${image.sourceUrl}\n`;
        attributionDoc += `- Creator: ${image.creator}\n`;
        attributionDoc += `- License: ${image.license}\n\n`;
      });
    }
  });
});

archive.append(attributionDoc, { name: 'ATTRIBUTION.md' });

  const imagesDir = path.join(__dirname, '../public/images');
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir, { recursive: true });
    files.forEach(file => {
      const filePath = path.join(imagesDir, file);
      if (fs.statSync(filePath).isFile()) {
        archive.file(filePath, { name: `images/${file}` });
      }
    });
  }

  // Create README file
  const readmeContent = `# ${website.businessName}

  


## Website Overview
${website.businessDescription}

## Setup Instructions
1. Unzip the contents of this file to your web hosting directory
2. No additional setup required - this is a static website

## Pages
${pages.map(page => `- ${page.slug === '/' ? 'index' : page.slug}.html - ${page.name}`).join('\n')}

## Generated on
${new Date().toLocaleDateString()}
`;

  archive.append(readmeContent, { name: 'README.md' });

  // Add common CSS
  const commonCss = generateCommonCss(website);
  archive.append(commonCss, { name: 'css/styles.css' });

  // Add common JavaScript
  const commonJs = generateCommonJs(website);
  archive.append(commonJs, { name: 'js/main.js' });

  // Add placeholder image
  const placeholderSvg = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#f8f9fa"/>
  <text x="400" y="200" font-family="Arial" font-size="30" text-anchor="middle" fill="#6c757d">Image Placeholder</text>
</svg>`;
  archive.append(placeholderSvg, { name: 'images/placeholder.svg' });

  // Process each page
  pages.forEach(page => {
    const filename = page.slug === '/' ? 'index.html' : `${page.slug}.html`;

    // Generate page-specific CSS
    let pageCSS = '';
    page.sections.forEach(section => {
      if (section.css) {
        pageCSS += section.css + '\n';
      }
    });

    if (pageCSS.trim()) {
      const pageCssFilename = `css/${page.slug === '/' ? 'index' : page.slug}.css`;
      archive.append(pageCSS, { name: pageCssFilename });
    }

    // Generate and add HTML file
    const content = generatePageHtml(website, page, pages, true);
    archive.append(content, { name: filename });
  });
}

/**
 * Add development-ready files to archive
 * @param {Object} archive - Archiver instance
 * @param {Object} website - Website data
 * @param {Array} pages - Pages data
 */
function addDevelopmentFiles(archive, website, pages) {
  // Create expanded directory structure
  archive.append(null, { name: 'css/' });
  archive.append(null, { name: 'js/' });
  archive.append(null, { name: 'images/' });
  archive.append(null, { name: 'src/' });
  archive.append(null, { name: 'src/scss/' });
  archive.append(null, { name: 'src/js/' });

  // Create README file
  const readmeContent = `# ${website.businessName}

## Website Overview
${website.businessDescription}

## Development Setup
1. Install Node.js and npm if not already installed
2. Run \`npm install\` to install dependencies
3. Run \`npm start\` to start the development server
4. Open your browser to http://localhost:3000

## Build for Production
1. Run \`npm run build\` to build the production version
2. Upload the contents of the \`dist\` directory to your web hosting

## Project Structure
- src/ - Source files
  - scss/ - SCSS source files
  - js/ - JavaScript source files
- css/ - Compiled CSS
- js/ - Compiled JavaScript
- images/ - Image assets

## Pages
${pages.map(page => `- ${page.slug === '/' ? 'index' : page.slug}.html - ${page.name}`).join('\n')}

## Generated on
${new Date().toLocaleDateString()}
`;

  archive.append(readmeContent, { name: 'README.md' });

  // Add package.json
  const packageJson = {
    "name": website.businessName.toLowerCase().replace(/[^a-z0-9]/gi, '-'),
    "version": "1.0.0",
    "description": website.businessDescription,
    "main": "index.js",
    "scripts": {
      "start": "live-server --port=3000",
      "build": "echo \"No build process configured\" && exit 0"
    },
    "dependencies": {
      "bootstrap": "^5.3.0"
    },
    "devDependencies": {
      "live-server": "^1.2.2"
    }
  };

  archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });

  // Add .gitignore
  const gitignore = `node_modules/
package-lock.json
.DS_Store
`;
  archive.append(gitignore, { name: '.gitignore' });

  // Add common CSS files
  const commonCss = generateCommonCss(website);
  archive.append(commonCss, { name: 'css/styles.css' });

  // Add SCSS source files
  const mainScss = `// Main SCSS file
$primary-color: ${website.primaryColor};
$secondary-color: ${website.secondaryColor};
$font-family: '${website.fontFamily}', sans-serif;

body {
  font-family: $font-family;
}

// Import component styles
@import 'header';
@import 'footer';
@import 'components';
`;

  const headerScss = `// Header styles
${website.header?.css || '// No header styles defined'}`;

  const footerScss = `// Footer styles
${website.footer?.css || '// No footer styles defined'}`;

  const componentsScss = `// Component styles
// Add your custom component styles here
`;

  archive.append(mainScss, { name: 'src/scss/main.scss' });
  archive.append(headerScss, { name: 'src/scss/_header.scss' });
  archive.append(footerScss, { name: 'src/scss/_footer.scss' });
  archive.append(componentsScss, { name: 'src/scss/_components.scss' });

  // Add JavaScript files
  const mainJs = generateCommonJs(website);
  archive.append(mainJs, { name: 'js/main.js' });

  // Add source JS files
  const srcMainJs = `// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('Website initialized');
  
  // Initialize components
  initNavigation();
});

// Navigation functionality
function initNavigation() {
  const navToggle = document.querySelector('.navbar-toggler');
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      const navId = this.getAttribute('data-bs-target');
      const navElement = document.querySelector(navId);
      if (navElement) {
        navElement.classList.toggle('show');
      }
    });
  }
}
`;

  archive.append(srcMainJs, { name: 'src/js/main.js' });

  // Add placeholder image
  const placeholderSvg = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#f8f9fa"/>
  <text x="400" y="200" font-family="Arial" font-size="30" text-anchor="middle" fill="#6c757d">Image Placeholder</text>
</svg>`;
  archive.append(placeholderSvg, { name: 'images/placeholder.svg' });

  // Process each page
  pages.forEach(page => {
    const filename = page.slug === '/' ? 'index.html' : `${page.slug}.html`;

    // Generate page-specific CSS
    let pageCSS = '';
    page.sections.forEach(section => {
      if (section.css) {
        pageCSS += section.css + '\n';
      }
    });

    if (pageCSS.trim()) {
      const pageCssFilename = `css/${page.slug === '/' ? 'index' : page.slug}.css`;
      archive.append(pageCSS, { name: pageCssFilename });

      // Also add SCSS source
      const pageScssFilename = `src/scss/pages/_${page.slug === '/' ? 'index' : page.slug}.scss`;
      archive.append(`// ${page.name} page styles\n${pageCSS}`, { name: pageScssFilename });
    }

    // Generate and add HTML file
    const content = generatePageHtml(website, page, pages, true);
    archive.append(content, { name: filename });
  });
}

/**
 * Generate HTML content for a page
 * @param {Object} website - Website data
 * @param {Object} page - Page data
 * @param {Array} allPages - All pages data for navigation
 * @param {Boolean} useExternalFiles - Whether to use external CSS/JS files
 * @returns {String} - HTML content
 */
function generatePageHtml(website, page, allPages, useExternalFiles = false) {
  const pageCssFilename = page.slug === '/' ? 'index' : page.slug;

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.seoTitle || `${page.name} - ${website.businessName}`}</title>
  <meta name="description" content="${page.seoDescription || website.businessDescription}">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${website.fontFamily.replace(' ', '+')}:wght@300;400;500;700&display=swap" rel="stylesheet">
  `;

  if (useExternalFiles) {
    html += `
  <!-- Custom CSS -->
  <link rel="stylesheet" href="css/styles.css">
  <!-- Attribution CSS -->
  <link rel="stylesheet" href="css/attribution.css">
  `;

    // Add page-specific CSS if it exists
    if (page.sections.some(section => section.css)) {
      html += `  <link rel="stylesheet" href="css/${pageCssFilename}.css">\n`;
    }
  } else {
    // Inline styles
    html += `
  <style>
    :root {
      --primary-color: ${website.primaryColor};
      --secondary-color: ${website.secondaryColor};
      --font-family: '${website.fontFamily}', sans-serif;
    }
    
    body {
      font-family: var(--font-family);
    }
    
    /* Header styles */
    ${website.header?.css || ''}
    
    /* Footer styles */
    ${website.footer?.css || ''}
    
    /* Page section styles */
    ${page.sections.map(section => section.css || '').join('\n\n')}

    /* Image attribution styles */
    .image-attribution {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      font-style: italic;
      text-align: right;
    }
    
    .image-attribution a {
      color: #666;
      text-decoration: underline;
    }
    
    .image-attribution a:hover {
      color: #333;
    }
  </style>
  `;
  }

  html += `
</head>
<body>
  <!-- Header -->
  <header>
    ${website.header?.content || generateDefaultHeader(website, page, allPages)}
  </header>
  
  <!-- Main Content -->
  <main>
    ${page.sections.map(section =>
    `<section id="${section.sectionReference}">\n      ${section.content}\n    </section>`
  ).join('\n\n')}
  </main>
  
  <!-- Footer -->
  <footer>
    ${website.footer?.content || generateDefaultFooter(website)}
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  `;

  if (useExternalFiles) {
    html += `  <script src="js/main.js"></script>\n`;
  } else {
    // Inline JavaScript
    html += `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize navigation
      const navToggle = document.querySelector('.navbar-toggler');
      if (navToggle) {
        navToggle.addEventListener('click', function() {
          const navId = this.getAttribute('data-bs-target');
          const navElement = document.querySelector(navId);
          if (navElement) {
            navElement.classList.toggle('show');
          }
        });
      }
    });
  </script>
  `;
  }

  html += `</body>
</html>`;

  return html;
}

/**
 * Generate common CSS for the website
 * @param {Object} website - Website data
 * @returns {String} - CSS content
 */
function generateCommonCss(website) {
  return `:root {
  --primary-color: ${website.primaryColor};
  --secondary-color: ${website.secondaryColor};
  --font-family: '${website.fontFamily}', sans-serif;
}

body {
  font-family: var(--font-family);
  line-height: 1.6;
  color: #333;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  margin-bottom: 1rem;
}

a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--secondary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.btn-secondary {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

/* Header styles */
${website.header?.css || ''}

/* Footer styles */
${website.footer?.css || ''}
`;
}

/**
 * Generate common JavaScript for the website
 * @param {Object} website - Website data
 * @returns {String} - JavaScript content
 */
function generateCommonJs(website) {
  return `// Main JavaScript file for ${website.businessName}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  const navToggle = document.querySelector('.navbar-toggler');
  if (navToggle) {
    navToggle.addEventListener('click', function() {
      const navId = this.getAttribute('data-bs-target');
      const navElement = document.querySelector(navId);
      if (navElement) {
        navElement.classList.toggle('show');
      }
    });
  }
  
  // Initialize smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});
`;
}

/**
 * Generate default header HTML if none exists
 * @param {Object} website - Website data
 * @param {Object} currentPage - Current page data
 * @param {Array} allPages - All pages data
 * @returns {String} - HTML content
 */
function generateDefaultHeader(website, currentPage, allPages) {
  return `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container">
    <a class="navbar-brand" href="index.html">${website.businessName}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        ${allPages.map(p => {
    const isActive = p._id.toString() === currentPage._id.toString();
    const href = p.slug === '/' ? 'index.html' : `${p.slug}.html`;
    return `<li class="nav-item">
          <a class="nav-link${isActive ? ' active' : ''}" href="${href}">${p.name}</a>
        </li>`;
  }).join('\n        ')}
      </ul>
    </div>
  </div>
</nav>`;
}

/**
 * Generate default footer HTML if none exists
 * @param {Object} website - Website data
 * @returns {String} - HTML content
 */
function generateDefaultFooter(website) {
  return `<div class="bg-dark text-white py-4">
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <h5>${website.businessName}</h5>
        <p>${website.businessDescription}</p>
      </div>
      <div class="col-md-6 text-md-end">
        <p>&copy; ${new Date().getFullYear()} ${website.businessName}. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>`;
}