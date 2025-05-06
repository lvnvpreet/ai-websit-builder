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
        - Create a responsive header with navigation menu
        - Use Bootstrap 5 for the base structure
        - Primary Color: ${primaryColor}
        - Secondary Color: ${secondaryColor}
        - Font Family: ${fontFamily}
        - Include the business name/logo and a navigation menu
        - Make it mobile-friendly with a hamburger menu on small screens
        
        NAVIGATION MENU:
        Include links to the following pages: ${pages.join(', ')}
        
        OUTPUT FORMAT:
        Return ONLY a JSON object with these keys:
        - "content": The HTML code for the header 
        - "css": Custom CSS styles for the header
        
        IMPORTANT GUIDELINES:
        1. Use semantic HTML5 elements
        2. Ensure the header is fully responsive
        3. Follow accessibility best practices
        4. Include all necessary Bootstrap classes
        5. Make sure the CSS is specific to the header elements
        6. Ensure the design matches the brand colors
        7. DO NOT add any explanation text outside the JSON object
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
        - Create a responsive footer with multiple columns
        - Use Bootstrap 5 for the base structure
        - Primary Color: ${primaryColor}
        - Secondary Color: ${secondaryColor}
        - Font Family: ${fontFamily}
        - Include copyright information with current year
        - Include quick links to main pages: ${pages.join(', ')}
        
        OUTPUT FORMAT:
        Return ONLY a JSON object with these keys:
        - "content": The HTML code for the footer
        - "css": Custom CSS styles for the footer
        
        IMPORTANT GUIDELINES:
        1. Use semantic HTML5 elements
        2. Ensure the footer is fully responsive
        3. Follow accessibility best practices
        4. Include all necessary Bootstrap classes
        5. Make sure the CSS is specific to the footer elements
        6. Include social media icons if social links are provided
        7. DO NOT add any explanation text outside the JSON object
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
        Create the following sections for the ${pageName} page:
        ${sectionDescriptions}
        
        OUTPUT FORMAT:
        Return ONLY a JSON object with a "sections" array. Each section in the array must have:
        - "sectionReference": A unique ID for the section (e.g., "section-hero-123456")
        - "content": The HTML content for the section
        - "css": The CSS styling specific to this section
        
        IMPORTANT GUIDELINES:
        1. Use semantic HTML5 elements
        2. Ensure all sections are fully responsive
        3. Follow accessibility best practices
        4. Include all necessary Bootstrap classes
        5. Make CSS selectors specific to each section (use the sectionReference)
        6. Create realistic, appealing placeholder content based on the business description
        7. Use appropriate heading levels (h1, h2, etc.) for good SEO
        8. DO NOT add any explanation text outside the JSON object
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
            - Headline that captures the main value proposition
            - Subheading with supporting message
            - Primary call-to-action button
            
          2. Introduction Section - Brief overview of the business with:
            - Engaging introduction text
            - Supporting image or icon
            - Secondary call-to-action
            
          3. Services/Features Section - Highlight key offerings with:
            - 3-4 key services or features in a grid or card layout
            - Icons or images for each service
            - Brief descriptions
            
          4. Testimonials Section - Build trust with:
            - 2-3 customer testimonials in cards or a carousel
            - Customer names and optional photos
        `;
        
        if (features.hasImageSlider) {
          sections += `
          5. Image Slider - Showcase imagery with:
            - Responsive image slider/carousel
            - 3-5 placeholder images with captions
            - Navigation controls
          `;
        }
        
        if (features.hasNewsletter) {
          sections += `
          6. Newsletter Section - Email capture with:
            - Brief benefit statement
            - Email input field
            - Submit button
            - Privacy note
          `;
        }
        
        sections += `
          7. Call to Action Section - Final conversion point with:
            - Compelling heading
            - Brief supporting text
            - Prominent call-to-action button
        `;
        
        return sections;
      }
      
      if (pageNameLower === 'about' || pageNameLower === 'about us') {
        return `
          1. Page Header Section - Introduction with:
            - Page title (About Us)
            - Brief overview statement
            - Optional breadcrumb navigation
            
          2. Our Story Section - Company history with:
            - Founding story
            - Company timeline or milestones
            - Supporting imagery
            
          3. Team Section - Team presentation with:
            - Team introduction
            - 3-4 team member profiles with placeholder images
            - Brief bios for each team member
            
          4. Values Section - Company values with:
            - 3-5 core values as cards or list items
            - Icons representing each value
            - Brief descriptions
            
          5. Call to Action Section - Next steps with:
            - Transition statement
            - Call-to-action button
        `;
      }
      
      if (pageNameLower === 'services' || pageNameLower === 'products') {
        return `
          1. Page Header Section - Introduction with:
            - Page title (Services/Products)
            - Brief overview statement
            - Optional breadcrumb navigation
            
          2. Services Overview Section - High-level overview with:
            - Introduction to service offerings
            - Visual representation of service categories
            
          3. Service Details Section - Detailed information with:
            - 4-6 individual service descriptions
            - Icons or images for each service
            - Benefits or features lists
            
          4. Process Section - How services work with:
            - Step-by-step process (3-5 steps)
            - Visual process flow
            - Brief description for each step
            
          5. Pricing Section (if applicable) - Pricing options with:
            - 3 pricing tiers or packages
            - Features included in each tier
            - Price points and call-to-action buttons
            
          6. FAQ Section - Common questions with:
            - 4-6 frequently asked questions
            - Concise answers
            - Expandable/collapsible format
            
          7. Call to Action Section - Final conversion point with:
            - Compelling heading
            - Brief supporting text
            - Prominent call-to-action button
        `;
      }
      
      if (pageNameLower === 'contact' || pageNameLower === 'contact us') {
        let sections = `
          1. Page Header Section - Introduction with:
            - Page title (Contact Us)
            - Brief invitation to get in touch
            - Optional breadcrumb navigation
            
          2. Contact Form Section - Input form with:
            - Name, email, phone fields
            - Message area
            - Subject selection (dropdown)
            - Submit button
            
          3. Contact Information Section - Business details with:
            - Address ${features.hasGoogleMap ? '(linked to map below)' : ''}
            - Phone number
            - Email address
            - Business hours
        `;
        
        if (features.hasGoogleMap) {
          sections += `
          4. Map Section - Location visualization with:
            - ${features.googleMapUrl ? 'Embedded Google Map from URL: ' + features.googleMapUrl : 'Placeholder for Google Map'}
            - Location marker
            - Optional directions link
          `;
        }
        
        return sections;
      }
      
      // Default page structure for other page types
      return `
        1. Page Header Section - Introduction with:
          - Page title (${pageName})
          - Brief introduction
          - Optional breadcrumb navigation
          
        2. Main Content Section - Primary content with:
          - Relevant information about ${pageName}
          - Supporting visuals
          - Organize content in a logical structure
          
        3. Secondary Content Section - Additional information with:
          - Related content
          - Supporting elements
          
        4. Call to Action Section - Next steps with:
          - Transition statement
          - Relevant call-to-action button
      `;
    }
  }
  
  module.exports = new PromptBuilder();