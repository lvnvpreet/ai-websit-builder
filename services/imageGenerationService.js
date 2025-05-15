// services/imageGenerationService.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ImageGenerationService {
  constructor() {
    this.apiKey = process.env.IMAGE_API_KEY;
    this.apiEndpoint = process.env.IMAGE_API_ENDPOINT;
  }

  async generateImage(prompt, options = {}) {
    try {
      // Example using a generic AI image generation API
      const response = await axios.post(this.apiEndpoint, {
        prompt: prompt,
        n: 1,
        size: options.size || "512x512",
        api_key: this.apiKey
      });

      if (response.data && response.data.data && response.data.data[0]) {
        // Get image URL or base64 data depending on API
        const imageUrl = response.data.data[0].url;
        
        // Download image
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        
        // Generate a unique filename
        const filename = `img_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const filepath = path.join(__dirname, '../public/images/generated', filename);
        
        // Ensure directory exists
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        
        // Save image
        fs.writeFileSync(filepath, imageResponse.data);
        
        return {
          success: true,
          filename,
          path: `/images/generated/${filename}`
        };
      }
      
      throw new Error('Failed to generate image');
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ImageGenerationService();