// services/imageSearchService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImageSearchService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.searchRights = "cc_publicdomain,cc_attribute,cc_sharealike"; // Copyright-safe images
    this.imageDir = path.join(__dirname, '../public/images/search');
    
    // Ensure image directory exists
    fs.mkdirSync(this.imageDir, { recursive: true });
  }

  /**
   * Search for images using Google Custom Search API
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchImages(query, options = {}) {
    try {
      console.log(`Searching for images: "${query}"`);
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: this.searchEngineId,
          q: query,
          searchType: 'image',
          rights: this.searchRights,
          num: options.num || 1,
          imgSize: options.imgSize || 'large',
          safe: 'active'
        }
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        const images = response.data.items.map(item => {
          // Parse domain for cleaner attribution
          const sourceUrl = item.image.contextLink || item.link;
          const sourceDomain = new URL(sourceUrl).hostname.replace('www.', '');
          
          return {
            url: item.link,
            title: item.title || 'Image',
            width: item.image.width,
            height: item.image.height,
            sourceUrl: sourceUrl,
            sourceDomain: sourceDomain,
            // Full attribution object with multiple format options
            attribution: {
              text: `Image by ${sourceDomain}`,
              html: `<a href="${sourceUrl}" target="_blank" rel="noopener">Image by ${sourceDomain}</a>`,
              license: item.rights || 'Image may be subject to copyright',
              creator: item.image.creator || sourceDomain
            }
          };
        });

        // Download the first image
        const selectedImage = await this._downloadImage(images[0]);
        
        console.log(`Image search successful, downloaded: ${selectedImage.filename}`);
        
        return {
          success: true,
          images: images,
          selectedImage: selectedImage
        };
      }
      
      console.log(`No images found for query: "${query}"`);
      return {
        success: false,
        error: 'No images found'
      };
    } catch (error) {
      console.error('Image search error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download and save an image
   * @param {Object} image - Image info
   * @returns {Promise<Object>} Downloaded image info
   * @private
   */
  async _downloadImage(image) {
    try {
      // Generate a unique filename based on image URL
      const hash = crypto.createHash('md5').update(image.url).digest('hex');
      const fileExt = path.extname(new URL(image.url).pathname) || '.jpg';
      const filename = `img_${hash}${fileExt}`;
      const filepath = path.join(this.imageDir, filename);
      
      // Check if image already exists
      if (fs.existsSync(filepath)) {
        console.log(`Image already exists: ${filepath}`);
        return {
          ...image,
          filename,
          path: `/images/search/${filename}`,
          filepath
        };
      }
      
      // Download the image
      const imageResponse = await axios.get(image.url, { 
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Save image
      fs.writeFileSync(filepath, imageResponse.data);
      
      return {
        ...image,
        filename,
        path: `/images/search/${filename}`,
        filepath
      };
    } catch (error) {
      console.error(`Error downloading image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get search query for a page section
   * @param {string} pageName - Name of the page
   * @param {string} sectionType - Type of section
   * @param {Object} websiteData - Website data
   * @returns {string} Search query
   */
  getSearchQuery(pageName, sectionType, websiteData) {
    const { businessName, businessCategory, businessDescription } = websiteData;
    let query = '';
    
    // Create specific query based on page and section type
    if (pageName.toLowerCase() === 'home' && sectionType === 'hero') {
      query = `${businessCategory} business hero image professional`;
    } else if (pageName.toLowerCase() === 'about' && sectionType === 'team') {
      query = `${businessCategory} team professional group`;
    } else if (pageName.toLowerCase() === 'services') {
      query = `${businessCategory} ${sectionType} professional`;
    } else if (pageName.toLowerCase() === 'contact') {
      query = `${businessCategory} contact customer service professional`;
    } else {
      // Generic query
      query = `${businessCategory} ${pageName} ${sectionType} professional`;
    }
    
    // Limit query length for better results
    return query.substring(0, 100);
  }
}

module.exports = new ImageSearchService();