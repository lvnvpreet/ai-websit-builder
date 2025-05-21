const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const marked = require('marked');

// Get OpenRouter setup documentation
router.get('/docs/openrouter-setup', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../public/docs/openrouter-setup.md');
    const markdown = await readFile(filePath, 'utf8');
    const htmlContent = marked.parse(markdown);
    
    res.render('documentation', { 
      title: 'OpenRouter Setup Guide',
      content: htmlContent
    });
  } catch (error) {
    console.error('Error loading documentation:', error);
    res.status(500).send('Error loading documentation');
  }
});

module.exports = router;
