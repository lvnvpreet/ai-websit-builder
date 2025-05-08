const Website = require('../models/Website');
const Page = require('../models/Page');

// Show the preview dashboard for a website
exports.getPreviewDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
     // Log the incoming request for debugging
     console.log(`Preview dashboard requested for website ID: ${id}`);

    // Find the website with populated pages
    const website = await Website.findOne({ _id: id, user: req.user._id });
    if (!website) {
      console.log(`Website not found with ID: ${id}`);
      return res.status(404).render('error', { 
        message: 'Website not found',
        error: { status: 404 }
      });
    }
    
    // Get all pages for this website
    const pages = await Page.find({ website: id });
    console.log(`Found ${pages.length} pages for website: ${id}`);
    
    res.render('preview/dashboard', {
      website,
      pages,
      title: `Preview: ${website.businessName}`
    });
  } catch (error) {
    console.error('Error loading preview dashboard:', error);
    res.status(500).render('error', {
      message: 'Error loading preview dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Preview a specific page
// File location: controllers/previewController.js

// Preview a specific page
exports.previewPage = async (req, res) => {
  try {
    const { websiteId, pageId } = req.params;
    
    console.log(`Page preview requested - Website ID: ${websiteId}, Page ID: ${pageId}`);
    
    // Find the website
    const website = await Website.findOne({ _id: websiteId, user: req.user._id });
    
    if (!website) {
      console.log(`Website not found with ID: ${websiteId}`);
      return res.status(404).render('error', { 
        message: 'Website not found',
        error: { status: 404 }
      });
    }

    console.log('Preview - Header exists:', !!website.header);
    console.log('Preview - Header has content:', !!(website.header && website.header.content));
    console.log('Preview - Footer exists:', !!website.footer);
    console.log('Preview - Footer has content:', !!(website.footer && website.footer.content));
    
    
    // Find the page by ID or slug
    let page;
    
    if (pageId === 'home') {
      // Find homepage (slug = '/')
      page = await Page.findOne({ website: websiteId, slug: '/' });
      console.log(`Looking for home page with slug '/': ${page ? 'Found' : 'Not found'}`);
    } else {
      // Try to find by ID first
      page = await Page.findOne({ _id: pageId, website: websiteId });
      
      // If not found, try to find by slug
      if (!page) {
        page = await Page.findOne({ slug: pageId, website: websiteId });
        console.log(`Looking for page by slug '${pageId}': ${page ? 'Found' : 'Not found'}`);
      } else {
        console.log(`Found page by ID: ${pageId}`);
      }
    }
    
    if (!page) {
      console.log(`Page not found for Website ID: ${websiteId}, Page ID: ${pageId}`);
      return res.status(404).render('error', { 
        message: 'Page not found',
        error: { status: 404 }
      });
    }
    
    // Get all pages for navigation
    const pages = await Page.find({ website: websiteId });
    console.log(`Found ${pages.length} total pages for navigation`);
    
    // Render the page
    res.render('preview/page', {
      website,
      page,
      pages,
      title: `${page.name} - ${website.businessName}`
    });
  } catch (error) {
    console.error('Error previewing page:', error);
    res.status(500).render('error', {
      message: 'Error previewing page',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// Preview as responsive (different device sizes)
exports.previewResponsive = async (req, res) => {
  try {
    const { websiteId, pageId, device } = req.params;
    
    // Validate device parameter
    const validDevices = ['mobile', 'tablet', 'desktop'];
    if (!validDevices.includes(device)) {
      return res.status(400).send('Invalid device type');
    }
    
    // Find the website
    const website = await Website.findOne({ _id: websiteId, user: req.user._id });
    if (!website) {
      return res.status(404).send('Website not found');
    }
    
    // Find the page
    let page;
    if (pageId === 'home') {
      page = await Page.findOne({ website: websiteId, slug: '/' });
    } else {
      page = await Page.findOne({ 
        $or: [
          { _id: pageId, website: websiteId },
          { slug: pageId, website: websiteId }
        ]
      });
    }
    
    if (!page) {
      return res.status(404).send('Page not found');
    }
    
    // Get all pages for navigation
    const pages = await Page.find({ website: websiteId });
    
    res.render('preview/responsive', {
      website,
      page,
      pages,
      device,
      title: `${device.charAt(0).toUpperCase() + device.slice(1)} Preview: ${page.name}`
    });
  } catch (error) {
    console.error('Error previewing responsive page:', error);
    res.status(500).send('Error previewing responsive page');
  }
};