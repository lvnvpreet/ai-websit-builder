// Configuration for Open Router API
module.exports = {
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseUrl: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1',
  defaultModel: process.env.OPENROUTER_MODEL || 'gpt-3.5-turbo',
  siteInfo: {
    name: process.env.SITE_NAME || 'AI Website Builder',
    website: process.env.SITE_WEBSITE || 'https://aiwebsitebuilder.com'
  },
  defaultParams: {
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 0.9,
    stop: []
  }
};
