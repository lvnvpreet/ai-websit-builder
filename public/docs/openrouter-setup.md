# Setting Up OpenRouter in AI Website Builder

This guide will help you set up and use OpenRouter as your AI provider in AI Website Builder. OpenRouter gives you access to many different AI models through a single API, including GPT models from OpenAI, Claude from Anthropic, Llama 3 from Meta, and many more.

## What is OpenRouter?

OpenRouter is a unified API gateway that gives you access to multiple AI models from different providers through a single API key and interface. This means you can switch between different AI models without having to change your implementation or manage multiple API keys.

## Benefits of Using OpenRouter

- **Access to multiple models**: Use models from OpenAI, Anthropic, Meta, and more
- **Simple billing**: Pay as you go, with transparent pricing for each model
- **Unified API**: No need to implement multiple different APIs
- **Fallback capabilities**: OpenRouter can automatically fall back to alternative models if your preferred model is unavailable

## Getting Started with OpenRouter

### 1. Create an OpenRouter Account

1. Visit [OpenRouter.ai](https://openrouter.ai/) and sign up for an account
2. Once registered, navigate to your dashboard

### 2. Generate an API Key

1. Go to the [API Keys section](https://openrouter.ai/keys)
2. Click "Create Key"
3. Give your key a name (e.g., "AI Website Builder")
4. Set any usage limits if desired
5. Click "Create"
6. Copy the generated API key

### 3. Configure OpenRouter in AI Website Builder

1. In AI Website Builder, navigate to your profile
2. Click on "AI Settings" in the sidebar
3. Select "Open Router" as your AI provider
4. Paste your API key in the "API Key" field
5. Select your preferred model from the dropdown
6. Click "Test Connection" to verify everything is working
7. Click "Save Settings" to save your configuration

### 4. Managing Your OpenRouter Usage

- Monitor your usage on the [OpenRouter dashboard](https://openrouter.ai/dashboard)
- Set spending limits in your OpenRouter account settings
- Check your current usage status in AI Website Builder by visiting your AI Settings page

## Available Models

OpenRouter provides access to many models, including:

- GPT-3.5 Turbo
- GPT-4
- Claude 3 (Opus, Sonnet, Haiku)
- Llama 3 (70B, 8B)
- Mistral models
- Many others

Each model has different capabilities, context lengths, and pricing. For a full list of models and their specifications, visit [OpenRouter Models](https://openrouter.ai/models).

## Troubleshooting

### API Key Issues

If you're receiving errors about your API key:
1. Verify you've copied the key correctly
2. Check if the key has any rate limits set
3. Generate a new key if needed

### Quota Exceeded

If you see "Quota Exceeded" messages:
1. Check your usage on the OpenRouter dashboard
2. Wait for the quota to reset (time shown in the error message)
3. Consider increasing your usage limits or switching to a pay-as-you-go plan

### Connection Problems

If you can't connect to OpenRouter:
1. Check your internet connection
2. Verify OpenRouter's service status at [status.openrouter.ai](https://status.openrouter.ai)
3. Ensure your API key has not been revoked

## Need Help?

For additional assistance:
- Check the [OpenRouter documentation](https://openrouter.ai/docs)
- Visit the [OpenRouter Discord community](https://discord.gg/openrouter)
- Contact AI Website Builder support

---

*Note: AI Website Builder is not affiliated with OpenRouter. OpenRouter is a third-party service that provides API access to various AI models.*
