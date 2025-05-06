const mongoose = require('mongoose');

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
  // Structure
  structure: {
    type: String,
    default: 'Multipage'
  },
  // Footer information
  address: String,
  email: String,
  phone: String,
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
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