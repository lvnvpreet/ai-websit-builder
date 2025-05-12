// services/promptBuilder.js

// Import examples from promptExamples.js
const {
  homePageExamples,
  aboutPageExamples,
  servicesPageExamples,
  contactPageExamples,
  blogPageExamples,
  portfolioPageExamples,
  faqPageExamples
} = require('./promptExamples');

/**
 * Service for building prompts for the Ollama generation pipeline
 */
class PromptBuilder {
  /**
   * Create a prompt for generating a website header
   * @param {Object} websiteData - Website configuration data
   * @returns {String} Formatted prompt
   */
  buildHeaderPrompt(websiteData) {
    const {
      businessName,
      businessCategory,
      businessDescription,
      websiteTitle,
      websiteTagline,
      primaryColor,
      secondaryColor,
      fontFamily,
      structure,
      pages
    } = websiteData;

    const isMultipage = structure === 'Multipage';
    const navigationInstructions = isMultipage 
      ? `Use filenames with .html extensions (e.g., "about.html", "services.html"). Homepage should be "/" or "index.html"` 
      : `Use anchor links with # (e.g., "#about", "#services", "#contact"). Homepage should be "#home"`;

    return `You are a professional web developer creating a responsive header navigation for a website.

WEBSITE DETAILS:
- Business Name: ${businessName}
- Business Category: ${businessCategory}
- Business Description: ${businessDescription}
- Website Title: ${websiteTitle}
- Tagline: ${websiteTagline}
- Website Structure: ${structure}

DESIGN PREFERENCES:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Font Family: ${fontFamily}

NAVIGATION REQUIREMENTS:
- Website Type: ${structure}
- Navigation Type: ${navigationInstructions}
- Available Pages: ${pages.join(', ')}

CRITICAL INSTRUCTIONS:
1. Generate ONLY the header HTML and CSS
2. DO NOT include full HTML document structure
3. DO NOT include <!DOCTYPE>, <html>, <head>, or <body> tags
4. Return ONLY a valid JSON object with the exact format shown below

REQUIRED OUTPUT FORMAT:
{
  "content": "Complete header HTML starting with <header> and ending with </header>",
  "css": "Complete CSS styles for the header"
}

HEADER REQUIREMENTS:
- Use Bootstrap 5 navbar structure
- Include responsive design with mobile hamburger menu
- Brand/logo with title "${websiteTitle}"
- Tagline "${websiteTagline}" displayed near logo (optional)
- Navigation menu with all provided pages
- Sticky header behavior on scroll
- Search functionality (hidden by default)
- Professional appearance matching ${businessCategory}

TAGLINE INTEGRATION:
- Include the tagline "${websiteTagline}" in a subtle way
- Options: below logo, next to logo on desktop, or in meta description
- Should not overwhelm the main navigation

CSS REQUIREMENTS:
- Use ${fontFamily} as the primary font family
- Background: ${primaryColor} for navbar background
- Text color: White or contrast color for visibility
- Use ${secondaryColor} for hover states and accents
- Include CSS variables for easy theming:
  --header-bg: ${primaryColor};
  --header-text: #ffffff;
  --header-accent: ${secondaryColor};

BUSINESS CONTEXT:
- Tailor the header design for ${businessCategory}
- Include subtle branding elements that reflect: ${businessDescription}
- Navigation should support ${structure === 'Multipage' ? 'multi-page navigation' : 'single-page smooth scrolling'}

Generate the complete header now.`;
  }

  /**
   * Create a prompt for generating a website footer
   * @param {Object} websiteData - Website configuration data
   * @returns {String} Formatted prompt
   */
  buildFooterPrompt(websiteData) {
    const {
      businessName,
      businessDescription,
      businessCategory,
      websiteTitle,
      websiteTagline,
      primaryColor,
      secondaryColor,
      fontFamily,
      structure,
      pages,
      address,
      email,
      phone,
      socialLinks
    } = websiteData;

    const isMultipage = structure === 'Multipage';

    return `RETURN ONLY JSON! NO EXPLANATION! NO ADDITIONAL TEXT!

{
  "content": "FOOTER HTML HERE",
  "css": "FOOTER CSS HERE"
}

THAT'S THE EXACT FORMAT! NOTHING ELSE!

WEBSITE DETAILS:
- Business Name: ${businessName}
- Business Category: ${businessCategory}
- Business Description: ${businessDescription}
- Website Title: ${websiteTitle}
- Tagline: ${websiteTagline}
- Website Structure: ${structure}

DESIGN REQUIREMENTS:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor} 
- Font Family: ${fontFamily}

CONTACT INFORMATION:
${address ? `- Address: ${address}` : ''}
${email ? `- Email: ${email}` : ''}
${phone ? `- Phone: ${phone}` : ''}

SOCIAL MEDIA LINKS:
${Object.entries(socialLinks || {}).map(([platform, username]) => 
  username ? `- ${platform}: ${platform}.com/${username}` : ''
).filter(Boolean).join('\n')}

NAVIGATION LINKS:
- Type: ${isMultipage ? 'File-based (.html extensions)' : 'Anchor-based (# links)'}
- Pages: ${pages.join(', ')}

OUTPUT MUST BE VALID JSON ONLY:
{
  "content": "Complete footer HTML starting with <footer> and ending with </footer>",
  "css": "Complete CSS styles for the footer"
}

DO NOT ADD ANY TEXT BEFORE OR AFTER THE JSON!
DO NOT ADD ANY EXPLANATIONS!
DO NOT INCLUDE "Here is" OR "Below is" OR ANY INTRODUCTORY TEXT!
RESPOND WITH JSON ONLY!`;
}

  /**
   * Create a prompt for generating a website page
   * @param {String} pageName - The name of the page (e.g., "Home", "About")
   * @param {Object} websiteData - Website configuration data
   * @returns {String} Formatted prompt
   */
  buildPagePrompt(pageName, websiteData) {
    const {
      businessName,
      businessCategory,
      businessDescription,
      websiteTitle,
      websiteTagline,
      websitePurpose,
      primaryColor,
      secondaryColor,
      fontFamily,
      structure,
      pages,
      hasNewsletter,
      hasGoogleMap,
      googleMapUrl,
      hasImageSlider
    } = websiteData;

    const isMultipage = structure === 'Multipage';
    const navigationInstructions = isMultipage 
      ? `Use filenames with .html extensions (e.g., "about.html", "services.html")` 
      : `Use anchor links with # (e.g., "#about", "#services")`;

    // Add examples section
    const examplesSection = this._getPageExamples(pageName, websiteData);

    return `You are a professional web developer creating a ${pageName} page for a ${structure} website.

WEBSITE DETAILS:
- Business: ${businessName} (${businessCategory})
- Description: ${businessDescription}
- Title: ${websiteTitle}
- Tagline: ${websiteTagline}
- Website Type: ${structure}
- Purpose: ${websitePurpose}

DESIGN REQUIREMENTS:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Font Family: ${fontFamily}

NAVIGATION REQUIREMENTS:
- Website Structure: ${structure}
- Navigation Type: ${navigationInstructions}
- Available Pages: ${pages.join(', ')}

${examplesSection}

CONTENT CONTEXT:
- Integrate business description: ${businessDescription}
- Reflect website purpose: ${websitePurpose}
- Include tagline where appropriate: ${websiteTagline}
- Target audience based on ${businessCategory}

CRITICAL INSTRUCTIONS:
1. Return ONLY a JSON object with a "sections" array
2. Each section must have complete HTML, CSS, and JavaScript
3. All navigation links must follow the correct pattern
4. All CSS must be scoped to prevent conflicts
5. All interactive elements must have JavaScript

OUTPUT FORMAT:
{
  "sections": [
    {
      "sectionReference": "unique-section-id",
      "content": "Complete HTML for this section",
      "css": "Complete CSS scoped to this section with unique selectors",
      "javascript": "Complete JavaScript for interactive features (optional)"
    }
  ]
}

PAGE SECTIONS FOR ${pageName}:
${this._getPageSections(pageName, { hasNewsletter, hasGoogleMap, googleMapUrl, hasImageSlider })}

DESIGN INTEGRATION:
- Use ${fontFamily} consistently throughout
- Primary color (${primaryColor}) for headings, CTAs, and brand elements
- Secondary color (${secondaryColor}) for accents, links, and hover states
- Maintain consistency with overall website title: ${websiteTitle}

BUSINESS-SPECIFIC CONTENT:
- Tailor content for ${businessCategory}
- Integrate tagline "${websiteTagline}" naturally
- Reference business description context
- Align with website purpose: ${websitePurpose}

Generate the ${pageName} page with all required sections now.`;
  }

  /**
   * Create a prompt for generating a specific section
   * @param {String} sectionType - Type of section (hero, services, contact, etc.)
   * @param {Object} context - Section context and requirements
   * @param {Object} websiteData - Website configuration data
   * @returns {String} Formatted prompt
   */
  buildSectionPrompt(sectionType, context, websiteData) {
    const {
      businessName,
      businessCategory,
      businessDescription,
      websiteTitle,
      websiteTagline,
      websitePurpose,
      structure,
      primaryColor,
      secondaryColor,
      fontFamily,
      pages
    } = websiteData;

    const isMultipage = structure === 'Multipage';
    const sectionId = `section-${sectionType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    return `Create a ${sectionType} section for a ${structure} website.

BUSINESS CONTEXT:
- Company: ${businessName}
- Category: ${businessCategory}
- Description: ${businessDescription}
- Title: ${websiteTitle}
- Tagline: ${websiteTagline}
- Purpose: ${websitePurpose}

DESIGN VARIABLES:
- Primary Color: ${primaryColor}
- Secondary Color: ${secondaryColor}
- Font Family: ${fontFamily}

NAVIGATION CONTEXT:
- Website Structure: ${structure}
- Available Pages: ${pages.join(', ')}
- Navigation Style: ${isMultipage ? 'File-based (.html)' : 'Anchor-based (#)'}

SECTION REQUIREMENTS:
- Type: ${sectionType}
- Section ID: ${sectionId}
- Context: ${context.description || ''}

RETURN FORMAT:
{
  "sectionReference": "${sectionId}",
  "content": "Complete HTML with semantic structure",
  "css": "Complete CSS with section-specific scope",
  "javascript": "Complete JavaScript for all interactive features"
}

CONTENT INTEGRATION:
- Use business tagline "${websiteTagline}" where appropriate
- Reference business description for context
- Align with website purpose: ${websitePurpose}
- Include links to other pages: ${pages.join(', ')}

STYLING REQUIREMENTS:
- Font Family: ${fontFamily}
- Primary Color (${primaryColor}) for main elements
- Secondary Color (${secondaryColor}) for accents and interactions
- Consistent with ${businessCategory} industry standards

SPECIFIC INSTRUCTIONS FOR ${sectionType}:
${this._getSectionSpecificInstructions(sectionType, context, websiteData)}

Generate the complete section now.`;
  }

  /**
   * Get page sections based on page type
   * @param {String} pageName - Name of the page
   * @param {Object} features - Special features to include
   * @returns {String} Section descriptions
   * @private
   */
  _getPageSections(pageName, features) {
    const pageNameLower = pageName.toLowerCase();
    
    switch (pageNameLower) {
      case 'home':
      case 'homepage':
        return this._getHomeSections(features);
      case 'about':
      case 'about us':
        return this._getAboutSections(features);
      case 'services':
      case 'products':
        return this._getServicesSections(features);
      case 'contact':
      case 'contact us':
        return this._getContactSections(features);
      case 'blog':
        return this._getBlogSections(features);
      default:
        return this._getGenericSections(pageName, features);
    }
  }

  /**
   * Get home page sections
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getHomeSections(features) {
    let sections = `
1. Hero Section
   - Eye-catching headline and subheadline
   - Primary CTA button
   - Hero image/video background
   - CSS: Full viewport height, overlay effects, responsive typography
   - JS: Scroll animations, parallax effects, video controls

2. Introduction Section
   - Business overview (2-3 paragraphs)
   - Key value propositions
   - Supporting imagery
   - CSS: Two-column layout, responsive spacing
   - JS: Intersection observer for scroll animations

3. Services/Features Section
   - Service cards with icons (4-6 items)
   - Detailed descriptions
   - Read more links/modals
   - CSS: Grid/flex layout, hover effects, card animations
   - JS: Card interactions, modal popups, tab functionality

4. Testimonials Section
   - Customer reviews (3-4 testimonials)
   - Star ratings, customer photos
   - Company/title information
   - CSS: Carousel styling, card design
   - JS: Testimonial slider, autoplay functionality`;

    if (features.hasImageSlider) {
      sections += `

5. Image Slider Section
   - Product/service showcase (5-7 images)
   - Navigation controls, pagination
   - Caption/description overlay
   - CSS: Full-width slider, responsive images
   - JS: Swiper.js integration, touch support, autoplay`;
    }

    if (features.hasNewsletter) {
      sections += `

6. Newsletter Section
   - Email capture form
   - Privacy notice, value proposition
   - Success/error states
   - CSS: Form styling, input focus states, validation styles
   - JS: Real-time validation, AJAX submission, success animations`;
    }

    sections += `

7. Call-to-Action Section
   - Final conversion push
   - Contact information
   - Multiple CTAs (call, email, form)
   - CSS: Full-width background, centered content
   - JS: Scroll-triggered animations, modal forms`;

    return sections;
  }

  /**
   * Get about page sections
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getAboutSections(features) {
    return `
1. Page Header Section
   - Page title with subtitle
   - Brief company introduction
   - Background image/video
   - CSS: Hero-style header, overlay effects
   - JS: Scroll animations

2. Company Story Section
   - Founding story with timeline
   - Mission and vision statements
   - Historical images/milestones
   - CSS: Timeline layout, image galleries
   - JS: Timeline animations, image lightbox

3. Team Section
   - Team member profiles (4-8 people)
   - Photos, titles, descriptions
   - Social media links
   - CSS: Grid layout, hover effects
   - JS: Team member modals, social links

4. Values/Mission Section
   - Core values (4-6 items)
   - Icons and descriptions
   - Impact statements
   - CSS: Card layout, icon animations
   - JS: Scroll-triggered animations

5. Achievements Section
   - Awards, certifications
   - Key statistics/metrics
   - Client logos (if applicable)
   - CSS: Statistics counters, logo grid
   - JS: Counter animations, logo carousel`;
  }

  /**
   * Get services page sections
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getServicesSections(features) {
    return `
1. Services Header Section
   - Page title and overview
   - Service categories navigation
   - CSS: Sticky navigation, active states
   - JS: Smooth scroll to sections

2. Service Overview Section
   - Service categories (3-4 main services)
   - Brief descriptions
   - Visual icons/images
   - CSS: Grid layout, hover effects
   - JS: Service detail modals

3. Detailed Service Sections
   - Individual service pages/sections
   - Pricing information (if applicable)
   - Process breakdown
   - CSS: Tabbed layout, accordion design
   - JS: Tab functionality, accordion toggles

4. Process Section
   - Step-by-step workflow (4-6 steps)
   - Visual process flow
   - Estimated timelines
   - CSS: Process flow design, animated numbers
   - JS: Step animations, progress indicators

5. Portfolio/Examples Section
   - Before/after examples
   - Case studies
   - Project gallery
   - CSS: Gallery grid, filter buttons
   - JS: Filtering functionality, lightbox

6. FAQ Section
   - Common questions (8-10 items)
   - Expandable answers
   - Search functionality
   - CSS: Accordion styling, search bar
   - JS: Accordion functionality, search filtering`;
  }

  /**
   * Get contact page sections
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getContactSections(features) {
    let sections = `
1. Contact Header Section
   - Page title and subtitle
   - Contact form introduction
   - CSS: Header styling, call-to-action
   - JS: None required

2. Contact Form Section
   - Name, email, phone, subject, message
   - Form validation
   - Success/error states
   - CSS: Form layout, validation styles, button states
   - JS: Real-time validation, AJAX submission, form reset

3. Contact Information Section
   - Address, phone, email, hours
   - Social media links
   - Office locations (if multiple)
   - CSS: Info cards, icon styling
   - JS: Click-to-call, click-to-email`;

    if (features.hasGoogleMap) {
      sections += `

4. Map Section
   - Google Maps embed
   - Custom markers
   - Directions button
   - CSS: Responsive map container, controls
   - JS: Google Maps API, marker customization, directions`;
    }

    sections += `

5. Quick Contact Section
   - Alternative contact methods
   - Live chat integration (optional)
   - Response time expectations
   - CSS: Quick contact cards, chat widget
   - JS: Chat widget initialization, contact tracking`;

    return sections;
  }

  /**
   * Get blog page sections
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getBlogSections(features) {
    return `
1. Blog Header Section
   - Page title and navigation
   - Search bar
   - Category filters
   - CSS: Header layout, search bar styling
   - JS: Search functionality, filter controls

2. Featured Posts Section
   - 2-3 highlighted posts
   - Large images, excerpts
   - Read more buttons
   - CSS: Hero card design, responsive layout
   - JS: Featured post carousel

3. Recent Posts Section
   - Blog post grid (6-9 posts)
   - Thumbnails, titles, dates
   - Pagination
   - CSS: Grid layout, card design
   - JS: Pagination, infinite scroll

4. Categories Sidebar
   - Post categories
   - Tag cloud
   - Archive links
   - CSS: Sidebar design, tag styling
   - JS: Category filtering, tag interactions

5. Newsletter Signup
   - Subscribe form
   - RSS feed link
   - Email preferences
   - CSS: Form styling, preference toggles
   - JS: Form validation, subscription handling`;
  }

  /**
   * Get generic page sections
   * @param {String} pageName - Name of the page
   * @param {Object} features - Special features
   * @returns {String} Section descriptions
   * @private
   */
  _getGenericSections(pageName, features) {
    return `
1. Page Header Section
   - Page title: ${pageName}
   - Brief introduction
   - Navigation breadcrumbs
   - CSS: Header styling, breadcrumb design
   - JS: None required

2. Main Content Section
   - Primary content (4-5 paragraphs)
   - Supporting visuals
   - Call-to-action
   - CSS: Content layout, typography
   - JS: Scroll animations

3. Secondary Content Section
   - Additional information
   - Related content
   - Links to other pages
   - CSS: Two-column layout, related content cards
   - JS: Content interactions

4. Call-to-Action Section
   - Final conversion point
   - Contact information
   - Next steps
   - CSS: Full-width CTA, button styling
   - JS: Scroll-triggered animations`;
  }

  /**
   * Get section-specific instructions
   * @param {String} sectionType - Type of section
   * @param {Object} context - Section context
   * @param {Object} websiteData - Website data
   * @returns {String} Section-specific instructions
   * @private
   */
  _getSectionSpecificInstructions(sectionType, context, websiteData) {
    const isMultipage = websiteData.structure === 'Multipage';
    const { websiteTitle, websiteTagline, primaryColor, secondaryColor, fontFamily } = websiteData;
    
    switch (sectionType.toLowerCase()) {
      case 'hero':
        return `
HERO SECTION REQUIREMENTS:
- Full viewport height (100vh or min-height)
- Background image/video with overlay
- Centered content with compelling headline
- Include business tagline: "${websiteTagline}"
- Primary CTA button with color: ${primaryColor}
- Scroll indicator at bottom

CSS SPECIFICS:
- Font family: ${fontFamily}
- Primary color: ${primaryColor}
- Secondary color: ${secondaryColor}
- Text shadow for readability
- Responsive font sizes (clamp())
- Button animations on hover

JAVASCRIPT:
- Parallax scrolling effect
- Scroll-to-next animation
- Video autoplay/pause controls (if video background)
- Smooth scroll to ${isMultipage ? 'contact.html' : '#contact'}`;

      case 'contact':
      case 'contact-form':
        return `
CONTACT FORM REQUIREMENTS:
- Form style using font family: ${fontFamily}
- Primary button color: ${primaryColor}
- Focus states using: ${secondaryColor}
- Fields: name, email, phone, subject, message
- Real-time validation with error messages
- AJAX submission without page reload
- Success/error state display
- Form reset after successful submission

CSS SPECIFICS:
- Custom form styling with ${fontFamily}
- Focus states for inputs using ${secondaryColor}
- Error/success message styling
- Loading state for submit button
- Button hover effects with ${primaryColor}`;

      case 'services':
      case 'features':
        return `
SERVICES SECTION REQUIREMENTS:
- Typography using: ${fontFamily}
- Card backgrounds and headers: ${primaryColor}
- Hover effects and accents: ${secondaryColor}
- Service cards in grid layout (3-4 columns)
- Icons for each service
- Service title and description
- Learn more links (${isMultipage ? 'to service detail pages' : 'to modal or expanded view'})

CSS SPECIFICS:
- Card hover effects with ${secondaryColor}
- Icon animations
- Grid responsive adjustments
- Card equal heights`;

      case 'footer':
        return `
FOOTER REQUIREMENTS:
- Font family: ${fontFamily}
- Background: ${primaryColor} (darkened)
- Link colors: ${secondaryColor}
- 3-4 column layout
- Company info with tagline: "${websiteTagline}"
- Navigation links for all pages
- Contact information
- Social media links
- Copyright notice
- Back-to-top button`;

      default:
        return `
GENERAL SECTION REQUIREMENTS:
- Font family: ${fontFamily}
- Primary colors: ${primaryColor}
- Accent colors: ${secondaryColor}
- Include website title context: "${websiteTitle}"
- Integrate tagline where appropriate: "${websiteTagline}"
- Semantic HTML structure
- Responsive design implementation
- Interactive elements with proper states`;
    }
  }

  /**
   * Generate navigation links based on website structure
   * @param {Array} pages - List of page names
   * @param {String} currentPage - Current active page
   * @param {Boolean} isMultipage - Whether website is multipage
   * @returns {String} HTML for navigation links
   * @private
   */
  generateNavigationLinks(pages, currentPage, isMultipage) {
    return pages.map(page => {
      const slug = page.toLowerCase().replace(/\s+/g, '-');
      const href = isMultipage 
        ? (page === 'Home' ? '/' : `${slug}.html`)
        : `#${slug}`;
      
      const isActive = currentPage === page;
      
      return `<li class="nav-item">
      <a class="nav-link ${isActive ? 'active' : ''}" href="${href}">
        ${page}
      </a>
    </li>`;
    }).join('\n          ');
  }

  /**
   * Generate CSS template with proper scoping
   * @param {String} sectionId - Section ID for scoping
   * @param {Object} styles - Style definitions
   * @param {Object} designVars - Design variables (colors, fonts)
   * @returns {String} Scoped CSS
   * @private
   */
  generateScopedCSS(sectionId, styles, designVars = {}) {
    const { primaryColor, secondaryColor, fontFamily } = designVars;
    
    return `
/* Section: ${sectionId} */
#${sectionId} {
  font-family: ${fontFamily || "'Open Sans', sans-serif"};
  ${styles.base || ''}
}

#${sectionId} h1,
#${sectionId} h2,
#${sectionId} h3 {
  color: ${primaryColor || '#333'};
  ${styles.headings || ''}
}

#${sectionId} .btn {
  background-color: ${primaryColor || '#007bff'};
  color: white;
  ${styles.buttons || ''}
}

#${sectionId} .btn:hover {
  background-color: ${secondaryColor || '#6c757d'};
  ${styles.buttonHover || ''}
}

#${sectionId} a {
  color: ${primaryColor || '#007bff'};
  ${styles.links || ''}
}

#${sectionId} a:hover {
  color: ${secondaryColor || '#6c757d'};
  ${styles.linkHover || ''}
}

/* Responsive Styles */
@media (max-width: 768px) {
  #${sectionId} {
    ${styles.mobile || ''}
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  #${sectionId} {
    ${styles.tablet || ''}
  }
}

@media (min-width: 1025px) {
  #${sectionId} {
    ${styles.desktop || ''}
  }
}`;
  }

  /**
   * Generate JavaScript template for sections
   * @param {String} sectionId - Section ID
   * @param {Object} functionality - Functionality definitions
   * @returns {String} Section JavaScript
   * @private
   */
  generateSectionJavaScript(sectionId, functionality) {
    const className = sectionId.replace(/[^a-zA-Z0-9]/g, '');
    
    return `
// Section: ${sectionId}
(function() {
  'use strict';
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    init${className}();
  });
  
  function init${className}() {
    const section = document.getElementById('${sectionId}');
    if (!section) {
      console.warn('Section not found: ${sectionId}');
      return;
    }
    
    // Initialize functionality
    ${functionality.initialization || ''}
    
    // Add event listeners
    ${functionality.eventListeners || ''}
    
    // Initialize third-party components
    ${functionality.thirdParty || ''}
  }
  
  // Helper functions
  ${functionality.helpers || ''}
  
  // Public API (if needed)
  window.${className} = {
    ${functionality.publicMethods || ''}
  };
  
})();`;
  }

  /**
   * Get examples for a specific page type
   * @param {String} pageName - Name of the page (e.g., "Home", "About")
   * @param {Object} websiteData - Website configuration data
   * @returns {String} Formatted examples for prompt
   */
  _getPageExamples(pageName, websiteData) {
    // Normalize page name for matching
    const pageNameLower = pageName.toLowerCase();
    
    // Select appropriate example set
    let examples;
    if (pageNameLower.includes('home')) {
      examples = homePageExamples;
    } else if (pageNameLower.includes('about')) {
      examples = aboutPageExamples;
    } else if (pageNameLower.includes('service')) {
      examples = servicesPageExamples;
    } else if (pageNameLower.includes('contact')) {
      examples = contactPageExamples;
    } else if (pageNameLower.includes('blog') || pageNameLower.includes('news')) {
      examples = blogPageExamples;
    } else if (pageNameLower.includes('portfolio') || pageNameLower.includes('gallery')) {
      examples = portfolioPageExamples;
    } else if (pageNameLower.includes('faq')) {
      examples = faqPageExamples;
    } else {
      // Default to home page examples if no match
      examples = homePageExamples;
    }
    
    // Get 2-3 relevant sections for this page type
    const relevantSections = this._getRelevantSections(pageNameLower, examples);
    
    // Format examples for the prompt
    let examplesText = `EXAMPLES OF HIGH-QUALITY SECTIONS FOR ${pageName.toUpperCase()}:\n\n`;
    
    // Add each section example
    for (const section of relevantSections) {
      const sectionExample = examples[section];
      if (sectionExample) {
        examplesText += `${section.toUpperCase()} SECTION EXAMPLE:\n`;
        examplesText += "```html\n";
        examplesText += this._customizeExample(sectionExample.html, websiteData);
        examplesText += "\n```\n\n";
        examplesText += "```css\n";
        examplesText += sectionExample.css;
        examplesText += "\n```\n\n";
      }
    }
    
    return examplesText;
  }

  /**
   * Get relevant section examples for a page type
   * @param {String} pageType - Type of page
   * @param {Object} examples - Example collection for that page
   * @returns {Array} List of section keys to use as examples
   * @private
   */
  _getRelevantSections(pageType, examples) {
    // Return 2-3 most important sections for each page type
    switch (pageType) {
      case 'home':
        return ['hero', 'services', 'testimonials'];
      case 'about':
        return ['header', 'story', 'team'];
      case 'service':
      case 'services':
        return ['header', 'overview', 'serviceDetail'];
      case 'contact':
        return ['header', 'form', 'map'];
      case 'blog':
      case 'news':
        return ['header', 'articles', 'sidebar']; // Assuming these exist in blogPageExamples
      case 'portfolio':
      case 'gallery':
        return ['header', 'projects', 'filters']; // Assuming these exist in portfolioPageExamples
      case 'faq':
        return ['header', 'questions', 'categories']; // Assuming these exist in faqPageExamples
      default:
        return Object.keys(examples).slice(0, 3); // Default to first 3 available
    }
  }

  /**
   * Customize example HTML with business-specific content
   * @param {String} exampleHtml - Example HTML template
   * @param {Object} websiteData - Website data for customization
   * @returns {String} Customized HTML
   * @private
   */
  _customizeExample(exampleHtml, websiteData) {
    const { businessName, businessCategory, websiteTagline, businessDescription } = websiteData;
    
    // Replace generic text with business-specific content
    let customized = exampleHtml
      .replace(/Your Company|Our Company|Company Name/g, businessName)
      .replace(/Expert Plumbing Solutions|Our Services/g, businessName)
      .replace(/Founded in 2005/g, websiteData.foundingYear ? `Founded in ${websiteData.foundingYear}` : 'Founded in 2005')
      .replace(/Business Avenue/g, websiteData.address ? websiteData.address : 'Business Avenue')
      .replace(/info@yourcompany\.com/g, websiteData.email ? websiteData.email : 'info@yourcompany.com')
      .replace(/\(555\) 123-4567/g, websiteData.phone ? websiteData.phone : '(555) 123-4567')
      .replace(/Professional plumbing services/g, websiteTagline || `Professional ${businessCategory} services`);
      
    // Only replace if business description exists
    if (businessDescription) {
      customized = customized.replace(/We provide top-quality plumbing services with reliability, integrity, and expertise/g, businessDescription);
    }
        
    return customized;
  }

  /**
   * Lighten a hex color by a percentage
   * @param {string} color - Hex color to lighten
   * @param {number} percent - Percentage to lighten by
   * @returns {string} Lightened color
   * @private
   */
  _lightenColor(color, percent) {
    // Remove the # if it exists
    color = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Lighten
    const lightenAmount = percent / 100;
    const lr = Math.min(255, Math.floor(r + (255 - r) * lightenAmount));
    const lg = Math.min(255, Math.floor(g + (255 - g) * lightenAmount));
    const lb = Math.min(255, Math.floor(b + (255 - b) * lightenAmount));

    // Convert back to hex
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  }

  /**
   * Darken a hex color by a percentage
   * @param {string} color - Hex color to darken
   * @param {number} percent - Percentage to darken by
   * @returns {string} Darkened color
   * @private
   */
  _darkenColor(color, percent) {
    // Remove the # if it exists
    color = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Darken
    const darkenAmount = percent / 100;
    const dr = Math.floor(r * (1 - darkenAmount));
    const dg = Math.floor(g * (1 - darkenAmount));
    const db = Math.floor(b * (1 - darkenAmount));

    // Convert back to hex
    return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
  }
}

module.exports = new PromptBuilder();