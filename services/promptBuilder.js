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
      websiteTitle,
      websiteTagline,
      primaryColor,
      secondaryColor,
      fontFamily,
      pages
    } = websiteData;

    return `
    You are a professional web developer creating a header for a website.
    
    WEBSITE DETAILS:
    Business Name: ${businessName}
    Business Category: ${businessCategory}
    Website Title: ${websiteTitle}
    Website Tagline: ${websiteTagline}
    
    DESIGN REQUIREMENTS:
    - Create a modern, professional, and visually appealing header
    - Use Bootstrap 5 for the responsive structure
    - Primary Color: ${primaryColor}
    - Secondary Color: ${secondaryColor}
    - Font Family: ${fontFamily}
    - Include the business name/logo and a navigation menu
    - Make it mobile-friendly with a hamburger menu on small screens
    
    STYLING REQUIREMENTS:
    - Use subtle shadows, depth effects, or gradients for a professional look
    - Include proper spacing (padding and margins) for better readability
    - Use proper contrast between text and background colors
    - Add subtle hover animations for interactive elements
    - Ensure consistent visual hierarchy with appropriate font sizing
    - Match the design aesthetic to the business category (${businessCategory})
    - Include subtle visual touches like micro-interactions or transitions
    
    NAVIGATION MENU:
    Include links to the following pages: ${pages.join(', ')}
    
    OUTPUT FORMAT:
    Return ONLY a JSON object with these keys:
    - "content": The HTML code for the header 
    - "css": Custom CSS styles for the header
    
    IMPORTANT CSS GUIDELINES:
    1. Use CSS variables for colors and reusable values
    2. Include responsive breakpoints for all screen sizes
    3. Add appropriate hover/focus states for interactive elements
    4. Add subtle animations for a polished feel (transitions, transforms)
    5. Include proper spacing with consistent margins and padding
    6. Use modern CSS techniques like flexbox and grid appropriately
    7. Ensure proper font sizes, weights, and line heights for readability
    8. Add appropriate shadows, borders, or effects for depth and professionalism
    9. Use appropriate text-transform, letter-spacing, and other typography properties
    10. Include specific selectors to avoid conflicts with other page styles
  `;
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
      primaryColor,
      secondaryColor,
      fontFamily,
      pages,
      address,
      email,
      phone,
      socialLinks
    } = websiteData;

    // Build social media links section if available
    let socialMediaSection = '';
    if (socialLinks && Object.values(socialLinks).some(link => link)) {
      socialMediaSection = 'SOCIAL MEDIA LINKS:';
      if (socialLinks.facebook) {
        socialMediaSection += `\n- Facebook: facebook.com/${socialLinks.facebook}`;
      }
      if (socialLinks.instagram) {
        socialMediaSection += `\n- Instagram: instagram.com/${socialLinks.instagram}`;
      }
      if (socialLinks.twitter) {
        socialMediaSection += `\n- Twitter: twitter.com/${socialLinks.twitter}`;
      }
      if (socialLinks.linkedin) {
        socialMediaSection += `\n- LinkedIn: linkedin.com/company/${socialLinks.linkedin}`;
      }
    }

    return `
      You are a professional web developer creating a footer for a website.
      
      WEBSITE DETAILS:
      Business Name: ${businessName}
      Business Description: ${businessDescription}
      
      CONTACT INFORMATION:
      ${address ? `Address: ${address}` : ''}
      ${email ? `Email: ${email}` : ''}
      ${phone ? `Phone: ${phone}` : ''}
      
      ${socialMediaSection}
      
      DESIGN REQUIREMENTS:
      - Create a professional and visually appealing footer with multiple columns
      - Use Bootstrap 5 for the base structure
      - Primary Color: ${primaryColor}
      - Secondary Color: ${secondaryColor}
      - Font Family: ${fontFamily}
      - Include copyright information with current year
      - Include quick links to main pages: ${pages.join(', ')}
      
      STYLING REQUIREMENTS:
      - Use a visually distinct background that complements the color scheme
      - Add appropriate spacing between sections and elements
      - Use proper contrast for text readability
      - Add subtle visual flourishes like dividers, icons, or background patterns
      - Create a cohesive, professional appearance that matches the header style
      - Include appropriate hover effects for links and interactive elements
      
      OUTPUT FORMAT:
      Return ONLY a JSON object with these keys:
      - "content": The HTML code for the footer
      - "css": Custom CSS styles for the footer
      
      IMPORTANT CSS GUIDELINES:
      1. Use CSS variables for colors and reusable values
      2. Add responsive breakpoints to ensure the footer looks good on all devices
      3. Include proper hover/focus states for links and buttons
      4. Use appropriate spacing with consistent margins and padding
      5. Create visual hierarchy with font sizing and weights
      6. Use modern CSS techniques like flexbox and grid appropriately
      7. Add subtle animations or transitions for interactive elements
      8. Include appropriate shadows, borders, or effects for depth and dimension
      9. Use proper selectors to avoid conflicts with other page styles
      10. Ensure social media icons are styled consistently and attractively
    `;
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
      hasNewsletter,
      hasGoogleMap,
      googleMapUrl,
      hasImageSlider
    } = websiteData;

    // Add page-specific section descriptions
    let sectionDescriptions = this._getSectionDescriptionsForPage(pageName, {
      hasNewsletter,
      hasGoogleMap,
      googleMapUrl,
      hasImageSlider
    });

    return `
      You are a professional web developer creating a ${pageName} page for a website.
      
      WEBSITE DETAILS:
      Business Name: ${businessName}
      Business Category: ${businessCategory}
      Business Description: ${businessDescription}
      Website Title: ${websiteTitle}
      Website Tagline: ${websiteTagline}
      Website Purpose: ${websitePurpose}
      
      DESIGN REQUIREMENTS:
      - Create a responsive, modern page design
      - Use Bootstrap 5 for the base structure
      - Primary Color: ${primaryColor}
      - Secondary Color: ${secondaryColor}
      - Font Family: ${fontFamily}
      
      PAGE STRUCTURE:
      Create the following sections for the ${pageName} page with EXTENSIVE and DETAILED content:
      ${sectionDescriptions}
      
      STYLING REQUIREMENTS:
      - Create visually distinct sections with appropriate padding and margins
      - Use a consistent and professional design aesthetic throughout
      - Add subtle animations, transitions, or interactions where appropriate
      - Incorporate visual hierarchy with typography, spacing, and color
      - Use shadows, borders, or effects to create depth and dimension
      - Add hover/focus states for interactive elements
      - Ensure text is highly readable with proper contrast and spacing
      - Use modern CSS techniques like flexbox, grid, and custom properties
      - Match the design to the business category (${businessCategory})
      - Add subtle background textures, patterns, or gradients where appropriate

      CONTENT REQUIREMENTS:
      - Generate proper, realistic, and extensive content for each section
      - Include at least 3-4 paragraphs of text for text-heavy sections
      - Provide 4-6 detailed items/points for list-based sections
      - Include appropriate headings, subheadings, and call-to-action elements
      - Match the tone to the business category (professional, friendly, technical, etc.)
      - AVOID placeholder-looking or generic content; make it specific to the business description
      
      OUTPUT FORMAT:
      Return ONLY a JSON object with a "sections" array. Each section in the array must have:
      - "sectionReference": A unique ID for the section (e.g., "section-hero-123456")
      - "content": The HTML content for the section
      - "css": The CSS styling specific to this section
      
      IMPORTANT HTML GUIDELINES:
      1. Use semantic HTML5 elements
      2. Ensure all sections are fully responsive
      3. Follow accessibility best practices
      4. Include all necessary Bootstrap classes
      5. Create realistic, appealing content based on the business description
      6. Use appropriate heading levels (h1, h2, etc.) for good SEO
      7. DO NOT add any explanation text outside the JSON object

      IMPORTANT CSS GUIDELINES:
      1. Create professional and polished designs with attention to detail
      2. Use CSS variables (custom properties) for consistent colors and values
      3. Add responsive design breakpoints for mobile, tablet, and desktop
      4. Include interactive hover and focus states for links and buttons
      5. Use appropriate spacing with consistent margins and padding
      6. Create visual hierarchy with font sizes, weights, and line heights
      7. Add subtle animations, transitions, or transform effects
      8. Use box-shadows, text-shadows, or borders to create depth
      9. Include appropriate letter-spacing and text-transform for headings
      10. Use modern CSS layout techniques like flexbox and grid
      11. Add background effects, gradients, or patterns where appropriate
      12. Ensure high contrast for readability but maintain a cohesive color scheme
    `;
  }

  /**
   * Create section descriptions based on the page type
   * @param {String} pageName - The name of the page
   * @param {Object} features - Special features to include
   * @returns {String} Section descriptions
   * @private
   */
  _getSectionDescriptionsForPage(pageName, features) {
    const pageNameLower = pageName.toLowerCase();

    if (pageNameLower === 'home' || pageNameLower === 'homepage') {
      let sections = `
        1. Hero Section - Create an eye-catching hero area with:
          - Strong headline capturing the main value proposition (25-50 characters)
          - Supporting subheading with more detail (50-100 characters)
          - Primary call-to-action button with compelling text
          - Background image or color that creates strong visual impact
          - Optional overlay text or graphics
          
        2. Introduction Section - Comprehensive business overview with:
          - At least 2-3 paragraphs explaining what makes the business unique
          - Mission statement or core philosophy
          - Supporting image, icon, or graphic element
          - Secondary call-to-action or link to more information
          
        3. Services/Features Section - Detailed highlights of offerings with:
          - 4-6 key services or features in a visually appealing grid or card layout
          - Distinctive icons or images for each service
          - 2-3 paragraphs describing each service/feature and its benefits
          - Optional "Learn More" links for each service
          
        4. Testimonials Section - Build trust with:
          - 3-4 detailed customer testimonials in cards or a carousel
          - Include full names, titles, and companies for more authenticity
          - Star ratings or other trust indicators where appropriate
          - Include specific benefits mentioned in testimonials
      `;

      if (features.hasImageSlider) {
        sections += `
        5. Image Slider - Showcase imagery with:
          - Responsive image slider/carousel
          - 3-5 placeholder images with detailed captions
          - Navigation controls
          - Call-to-action or information overlay on each slide
          - Descriptions that tell a story about the business
        `;
      }

      if (features.hasNewsletter) {
        sections += `
        6. Newsletter Section - Email capture with:
          - Compelling benefit statement (why should someone subscribe?)
          - Email input field with validation
          - Submit button with clear action text
          - Privacy note or GDPR compliance text
          - Brief explanation of newsletter content and frequency
        `;
      }

      sections += `
        7. Call to Action Section - Final conversion point with:
          - Bold, compelling heading (20-40 characters)
          - Supporting text explaining the value proposition (60-100 characters)
          - Prominent call-to-action button with action-oriented text
          - Visual elements to draw attention
          - Optional trust indicators or guarantees
      `;

      return sections;
    }

    if (pageNameLower === 'about' || pageNameLower === 'about us') {
      return `
        1. Page Header Section - Introduction with:
          - Bold page title (About Us)
          - Compelling overview statement (100-150 characters)
          - Optional breadcrumb navigation
          - Visual element that represents the company's identity
          
        2. Our Story Section - Company history with:
          - Founding story with specific details (dates, names, locations)
          - 3-4 paragraphs about the company journey
          - Company timeline or milestone highlights (at least 5-7 milestones)
          - Supporting imagery that illustrates company growth
          - Quotes from founders or key team members
          
        3. Team Section - Team presentation with:
          - Team introduction (why our team is exceptional)
          - 4-6 team member profiles with placeholder images
          - Detailed bios for each team member (150-200 words each)
          - Roles, responsibilities, and expertise areas
          - Professional achievements and qualifications
          
        4. Values Section - Company values with:
          - Introduction to company philosophy
          - 4-6 core values as cards or list items
          - Icons representing each value
          - 2-3 paragraphs explaining each value in practice
          - Examples of how values guide business decisions
          
        5. Call to Action Section - Next steps with:
          - Transition statement connecting values to action
          - Call-to-action button with clear purpose
          - Supporting text explaining what happens next
          - Visual elements reinforcing the action
      `;
    }

    if (pageNameLower === 'services' || pageNameLower === 'products') {
      return `
        1. Page Header Section - Introduction with:
          - Page title (Services/Products) with impact
          - Comprehensive overview statement (100-150 characters)
          - Optional breadcrumb navigation
          - Visual distinction between service categories
          
        2. Services Overview Section - High-level overview with:
          - Introduction to service offerings (2-3 paragraphs)
          - Visual representation of service categories
          - Benefits/outcomes of working with the business
          - Brief explanation of service methodology or approach
          
        3. Service Details Section - Detailed information with:
          - 5-7 individual service descriptions
          - Icons or images for each service
          - 2-3 paragraphs describing each service in detail
          - Specific benefits or features lists (5-7 points per service)
          - Potential outcomes or results for each service
          
        4. Process Section - How services work with:
          - Step-by-step process (4-6 steps)
          - Visual process flow with icons or graphics
          - Detailed description for each step (100-150 words each)
          - Estimated timelines where applicable
          - Client responsibilities and expectations
          
        5. Pricing Section (if applicable) - Pricing options with:
          - 3-4 pricing tiers or packages
          - Detailed features included in each tier (8-10 points)
          - Price points and call-to-action buttons
          - Highlighted recommended option
          - Comparison of features across tiers
          
        6. FAQ Section - Common questions with:
          - 6-8 frequently asked questions
          - Comprehensive answers (100-150 words each)
          - Expandable/collapsible format
          - Additional resources or links where relevant
          
        7. Call to Action Section - Final conversion point with:
          - Compelling heading that drives action
          - Supporting text highlighting key benefits
          - Prominent call-to-action button
          - Trust indicators (guarantees, testimonials)
          - Optional contact information or timeframes
      `;
    }

    if (pageNameLower === 'contact' || pageNameLower === 'contact us') {
      let sections = `
        1. Page Header Section - Introduction with:
          - Bold page title (Contact Us)
          - Warm invitation to get in touch (80-120 characters)
          - Brief explanation of response time expectations
          - Optional breadcrumb navigation
          
        2. Contact Form Section - Input form with:
          - Name, email, phone fields with proper validation
          - Subject dropdown with 5-7 relevant options
          - Detailed message area with placeholder text
          - File upload if relevant for business context
          - Clear submit button with action text
          - GDPR/privacy statement
          
        3. Contact Information Section - Business details with:
          - Physical address with optional directions link ${features.hasGoogleMap ? '(linked to map below)' : ''}
          - Phone number(s) with specified departments if applicable
          - Email address(es) with specified departments if applicable
          - Business hours with timezone
          - Response time expectations
          - Social media contact options if relevant
      `;

      if (features.hasGoogleMap) {
        sections += `
        4. Map Section - Location visualization with:
          - ${features.googleMapUrl ? 'Embedded Google Map from URL: ' + features.googleMapUrl : 'Placeholder for Google Map'}
          - Location marker with popup information
          - Directions link or button
          - Nearby landmarks or parking information
          - Address details repeated for clarity
          - Accessibility information if applicable
        `;
      }

      return sections;
    }

    if (pageNameLower === 'blog') {
      return `
        1. Blog Header Section - Introduction with:
          - Engaging page title
          - Blog description (150-200 characters)
          - Search functionality or topic filters
          - Newsletter signup if applicable
          
        2. Featured Posts Section - Highlighted content with:
          - 3-4 featured posts in card format
          - Featured image for each post
          - Post title, date, and author
          - Category or tag information
          - Brief excerpt (100-150 characters)
          - Read more link or button
          
        3. Recent Posts Section - Latest content with:
          - 5-7 recent posts in list or grid format
          - Thumbnail image for each post
          - Post title, date, author, and read time
          - Brief excerpt or summary
          - Engagement metrics (views, comments)
          - Category or tag indicators
          
        4. Categories Section - Content organization with:
          - Primary blog categories (5-8 categories)
          - Post count for each category
          - Brief category descriptions
          - Visual indicators or icons
          - Links to category archives
      `;
    }

    // Generic page sections for other page types
    return `
      1. Page Header Section - Introduction with:
        - Bold page title (${pageName})
        - Comprehensive introduction (150-200 characters)
        - Visual element that reinforces page purpose
        - Optional breadcrumb navigation
        
      2. Main Content Section - Primary content with:
        - 4-5 paragraphs of detailed information about ${pageName}
        - Supporting visuals, icons, or graphics
        - Organized content with clear headings and subheadings
        - Bullet points or numbered lists where appropriate
        - Quotes or highlighted text for emphasis
        
      3. Secondary Content Section - Additional information with:
        - Related content (2-3 paragraphs)
        - Supporting elements (images, tables, charts)
        - Cross-references to other relevant pages
        - Downloads or resources if applicable
        - Visual separation from main content
        
      4. Call to Action Section - Next steps with:
        - Clear transition statement
        - Compelling call-to-action button
        - Supporting text explaining the action benefit
        - Visual elements drawing attention to the CTA
        - Alternative contact or information options
    `;
  }
}

module.exports = new PromptBuilder();