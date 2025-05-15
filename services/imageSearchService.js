// services/imageSearchService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ImageSearchService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.searchRights = "cc_publicdomain,cc_attribute,cc_sharealike"; // For copyright-safe images
  }

  async searchImages(query, options = {}) {
    try {
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
        const images = response.data.items.map(item => ({
          url: item.link,
          title: item.title,
          source: item.image.contextLink,
          attribution: `Image from ${new URL(item.image.contextLink).hostname}`
        }));

        // Download first image
        const imageUrl = images[0].url;
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Generate a unique filename
        const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        const filepath = path.join(__dirname, '../public/images/search', filename);
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        
        // Save image
        fs.writeFileSync(filepath, imageResponse.data);
        
        return {
          success: true,
          images,
          selectedImage: {
            filename,
            path: `/images/search/${filename}`,
            attribution: images[0].attribution,
            source: images[0].source
          }
        };
      }
      
      return {
        success: false,
        error: 'No images found'
      };
    } catch (error) {
      console.error('Image search error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ImageSearchService();