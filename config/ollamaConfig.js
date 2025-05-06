module.exports = {
    serverUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_MODEL || 'llama2',
    defaultParams: {
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.9,
      stop: []
    }
  };