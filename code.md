You are a professional web developer creating a responsive header navigation for a website.

WEBSITE DETAILS:

* Business Name: **GreenLeaf Organics**
* Business Category: **Organic Food Store**
* Business Description: **A local shop specializing in fresh, organic produce and sustainable groceries**
* Website Title: **GreenLeaf Organics**
* Tagline: **"Freshness You Can Taste"**
* Website Structure: **Multipage**

DESIGN PREFERENCES:

* Primary Color: **#2E8B57**
* Secondary Color: **#FFD700**
* Font Family: **"Roboto", sans-serif**

NAVIGATION REQUIREMENTS:

* Website Type: **Multipage**
* Navigation Type: **Bootstrap 5 navbar with responsive hamburger menu**
* Available Pages: **Home, About Us, Products, Recipes, Blog, Contact**

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

* Use Bootstrap 5 navbar structure
* Include responsive design with mobile hamburger menu
* Brand/logo with title "GreenLeaf Organics"
* Tagline "Freshness You Can Taste" displayed near logo (optional)
* Navigation menu with all provided pages
* Sticky header behavior on scroll
* Search functionality (hidden by default)
* Professional appearance matching Organic Food Store

TAGLINE INTEGRATION:

* Include the tagline "Freshness You Can Taste" in a subtle way
* Options: below logo, next to logo on desktop, or in meta description
* Should not overwhelm the main navigation

CSS REQUIREMENTS:

* Use "Roboto", sans-serif as the primary font family
* Background: #2E8B57 for navbar background
* Text color: White or contrast color for visibility
* Use #FFD700 for hover states and accents
* Include CSS variables for easy theming:
  \--header-bg: #2E8B57;
  \--header-text: #ffffff;
  \--header-accent: #FFD700;

BUSINESS CONTEXT:

* Tailor the header design for Organic Food Store
* Include subtle branding elements that reflect: A local shop specializing in fresh, organic produce and sustainable groceries
* Navigation should support multi-page navigation

Generate the complete header now.