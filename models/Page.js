const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  sectionReference: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  css: String,
  type: String
});

const PageSchema = new mongoose.Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  seoTitle: String,
  seoDescription: String,
  sections: [SectionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Page', PageSchema);