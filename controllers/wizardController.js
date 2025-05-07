const Website = require('../models/Website');
const User = require('../models/User');

// Render the first step of the wizard - Business Information
exports.getBusinessInfo = (req, res) => {
  res.render('wizard/step1-business', {
    step: 1,
    totalSteps: 6,
    title: 'Business Information'
  });
};

// Process step 1 submission and move to step 2
exports.postBusinessInfo = (req, res) => {
  const { businessName, businessCategory, businessDescription } = req.body;

  // Store in session for later use
  req.session.wizardData = {
    ...req.session.wizardData,
    businessName,
    businessCategory,
    businessDescription
  };

  res.redirect('/wizard/website-info');
};

// Render step 2 - Website Information
exports.getWebsiteInfo = (req, res) => {
  const wizardData = req.session.wizardData || {};

  res.render('wizard/step2-website', {
    step: 2,
    totalSteps: 6,
    title: 'Website Information',
    data: wizardData
  });
};

// Process step 2 submission and move to step 3
exports.postWebsiteInfo = (req, res) => {
  const { websiteTitle, websiteTagline, websiteType, websitePurpose } = req.body;

  req.session.wizardData = {
    ...req.session.wizardData,
    websiteTitle,
    websiteTagline,
    websiteType,
    websitePurpose
  };

  res.redirect('/wizard/theme');
};

// Render step 3 - Theme Selection
exports.getTheme = (req, res) => {
  const wizardData = req.session.wizardData || {};

  res.render('wizard/step3-theme', {
    step: 3,
    totalSteps: 6,
    title: 'Theme Selection',
    data: wizardData
  });
};

// Process step 3 submission and move to step 4
exports.postTheme = (req, res) => {
  const { primaryColor, secondaryColor, fontFamily, fontStyle } = req.body;

  req.session.wizardData = {
    ...req.session.wizardData,
    primaryColor,
    secondaryColor,
    fontFamily,
    fontStyle
  };

  res.redirect('/wizard/structure');
};

// Render step 4 - Website Structure
exports.getStructure = (req, res) => {
  const wizardData = req.session.wizardData || {};

  res.render('wizard/step4-structure', {
    step: 4,
    totalSteps: 6,
    title: 'Website Structure',
    data: wizardData
  });
};

// Process step 4 submission and move to step 5
exports.postStructure = (req, res) => {
  const { structure, pages } = req.body;

  // Convert pages from form data to an array
  const pagesArray = Array.isArray(pages) ? pages : pages.split(',').map(page => page.trim());

  req.session.wizardData = {
    ...req.session.wizardData,
    structure,
    pages: pagesArray
  };

  res.redirect('/wizard/footer');
};

// Render step 5 - Footer Information
exports.getFooter = (req, res) => {
  const wizardData = req.session.wizardData || {};

  res.render('wizard/step5-footer', {
    step: 5,
    totalSteps: 6,
    title: 'Footer Information',
    data: wizardData
  });
};

// Process step 5 submission and move to step 6
exports.postFooter = (req, res) => {
  const { address, email, phone, facebook, instagram, twitter, linkedin } = req.body;

  req.session.wizardData = {
    ...req.session.wizardData,
    address,
    email,
    phone,
    socialLinks: {
      facebook,
      instagram,
      twitter,
      linkedin
    }
  };

  res.redirect('/wizard/features');
};

// Render step 6 - Additional Features
exports.getFeatures = (req, res) => {
  const wizardData = req.session.wizardData || {};

  res.render('wizard/step6-features', {
    step: 6,
    totalSteps: 6,
    title: 'Additional Features',
    data: wizardData
  });
};

// Process step 6 submission and move to summary
exports.postFeatures = (req, res) => {
  const { hasNewsletter, hasGoogleMap, googleMapUrl, hasImageSlider } = req.body;

  req.session.wizardData = {
    ...req.session.wizardData,
    hasNewsletter: hasNewsletter === 'on',
    hasGoogleMap: hasGoogleMap === 'on',
    googleMapUrl,
    hasImageSlider: hasImageSlider === 'on'
  };

  res.redirect('/wizard/summary');
};

// Render the summary page
exports.getSummary = async (req, res) => {
  try {
    const wizardData = req.session.wizardData || {};

    // Create a dummy website ID or use a form-based approach
    // We're not creating a real website yet

    res.render('wizard/summary', {
      title: 'Summary',
      data: wizardData,
      // Pass an action URL for the form
      formAction: '/wizard/generate'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error rendering summary page');
  }
};

// Save the website data and initiate generation
exports.saveWebsite = async (req, res) => {
  try {
    const wizardData = req.session.wizardData;

    console.log("wizardData from session:", wizardData ? "Found" : "Missing");

    if (!wizardData) {
      console.log("No wizard data found in session");
      return res.status(400).json({ success: false, message: 'No website data found' });
    }

    console.log("Creating website document");

    // Create new website document from wizard data
    const website = new Website({
      user: req.session.userId,
      businessName: wizardData.businessName,
      businessCategory: wizardData.businessCategory,
      businessDescription: wizardData.businessDescription,
      websiteTitle: wizardData.websiteTitle,
      websiteTagline: wizardData.websiteTagline,
      websiteType: wizardData.websiteType,
      websitePurpose: wizardData.websitePurpose,
      primaryColor: wizardData.primaryColor,
      secondaryColor: wizardData.secondaryColor,
      fontFamily: wizardData.fontFamily,
      fontStyle: wizardData.fontStyle,
      structure: wizardData.structure,
      address: wizardData.address,
      email: wizardData.email,
      phone: wizardData.phone,
      socialLinks: wizardData.socialLinks,
      hasNewsletter: wizardData.hasNewsletter,
      hasGoogleMap: wizardData.hasGoogleMap,
      googleMapUrl: wizardData.googleMapUrl,
      hasImageSlider: wizardData.hasImageSlider,
      status: 'pending'
    });

    if (!wizardData) {
      console.log("No wizard data found in session");
      return res.status(400).json({ success: false, message: 'No website data found' });
    }

    await website.save();

    console.log("Website saved, ID:", website._id);

    // Clear wizard data from session
    delete req.session.wizardData;

    console.log("Redirecting to:", `/generate/${website._id}`);

    // Redirect to generation page
    res.redirect(`/generate/${website._id}`);
  } catch (err) {
    console.error("Error in saveWebsite:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};