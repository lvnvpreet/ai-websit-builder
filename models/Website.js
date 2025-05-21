const mongoose = require('mongoose');

const ThemeCustomizationSchema = new mongoose.Schema({
  primary: {
    type: String,
    default: '#007bff'
  },
  secondary: {
    type: String,
    default: '#6c757d'
  },
  accent: {
    type: String,
    default: '#e74c3c'
  },
  fontHeadings: {
    type: String,
    default: "'Montserrat', sans-serif"
  },
  fontBody: {
    type: String,
    default: "'Open Sans', sans-serif"
  },
  borderRadius: {
    type: String,
    default: '4px'
  },
  spacing: {
    type: String,
    default: 'normal'
  },
  layoutType: {
    type: String,
    default: 'standard'
  },
  customCSS: String
}, { _id: false });

const TestVariantSchema = new mongoose.Schema({
  id: String,
  name: String,
  themeCustomizations: ThemeCustomizationSchema,
  previewPath: String,
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 }
  }
}, { _id: false });

const WebsiteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Business information
  businessName: {
    type: String,
    required: true
  },
  businessCategory: {
    type: String,
    required: true
  },
  businessDescription: {
    type: String,
    required: true
  },
  // Website information
  websiteTitle: {
    type: String,
    required: true
  },
  websiteTagline: {
    type: String
  },
  websiteType: {
    type: String,
    required: true
  },
  websitePurpose: {
    type: String,
    required: true
  },
  // Theme information
  primaryColor: {
    type: String,
    default: '#007bff'
  },
  secondaryColor: {
    type: String,
    default: '#6c757d'
  },
  fontFamily: {
    type: String,
    default: 'Open Sans'
  },
  fontStyle: {
    type: String,
    default: 'Clean, professional'
  },
  // Advanced theme customization
  themeCustomizations: ThemeCustomizationSchema,
  // A/B Testing variants
  abTestVariants: [TestVariantSchema],
  // Structure
  structure: {
    type: String,
    default: 'Multipage'
  },
  // Pages
  pages: {
    type: [String],
    default: ['Home', 'About', 'Services', 'Contact']
  },
  // Footer information
  address: String,
  email: String,
  phone: String,
  address: String,
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  // Header and footer content
  header: {
    content: String,
    css: String
  },
  footer: {
    content: String,
    css: String
  },
  // Additional features
  hasNewsletter: {
    type: Boolean,
    default: false
  },
  hasGoogleMap: {
    type: Boolean,
    default: false
  },
  googleMapUrl: String,
  hasImageSlider: {
    type: Boolean,
    default: false
  },
  // Generation status
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  generatedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Website', WebsiteSchema);