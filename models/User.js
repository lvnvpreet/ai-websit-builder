const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // OpenAI API key for integration
  openaiApiKey: {
    type: String
  },
  // AI provider settings
  llmSettings: {
    provider: {
      type: String,
      enum: ['ollama', 'openai', 'anthropic', 'openrouter'],
      default: 'ollama'
    },
    // Ollama settings
    ollamaServerUrl: {
      type: String,
      default: 'http://localhost:11434'
    },
    ollamaModelName: {
      type: String,
      default: 'llama2'
    },
    // Anthropic settings
    anthropicApiKey: String,
    // OpenRouter settings
    openRouterApiKey: String,
    openRouterModelName: {
      type: String,
      default: 'gpt-3.5-turbo'
    }
  }
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);