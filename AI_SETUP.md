# AI Assistant Setup Guide

This guide will help you set up the AI assistant feature in your web app, similar to Cursor's AI interface.

## Features

The AI assistant provides:
- **Multi-provider support**: Perplexity, Gemini Pro, Claude, and GPT-4
- **Context-aware responses**: Understands your current file and code
- **Code suggestions**: Can suggest improvements and optimizations
- **File creation**: Can create new files with generated code
- **Code modifications**: Can suggest changes to existing files
- **Intelligent agent selection**: Automatically chooses the best available AI provider

## Setup Instructions

### 1. Install Dependencies

First, install the required dependencies in the server directory:

```bash
cd server
npm install
```

### 2. Configure API Keys

Create a `.env` file in the `server` directory and add your API keys:

```bash
cd server
cp env.example .env
```

Then edit the `.env` file and add your API keys:

```env
# Perplexity AI (https://www.perplexity.ai/)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Google Gemini Pro (https://ai.google.dev/)
GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Claude (https://console.anthropic.com/)
CLAUDE_API_KEY=your_claude_api_key_here

# OpenAI GPT-4 (https://platform.openai.com/)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get API Keys

#### Perplexity AI (Recommended - Fastest)
1. Go to [https://www.perplexity.ai/](https://www.perplexity.ai/)
2. Sign up for an account
3. Go to Settings → API Keys
4. Create a new API key
5. Add it to your `.env` file

#### Google Gemini Pro
1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new project
4. Enable the Gemini API
5. Create an API key
6. Add it to your `.env` file

#### Anthropic Claude
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up for an account
3. Go to API Keys
4. Create a new API key
5. Add it to your `.env` file

#### OpenAI GPT-4
1. Go to [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up for an account
3. Go to API Keys
4. Create a new API key
5. Add it to your `.env` file

### 4. Start the Application

```bash
# Start the server
cd server
npm start

# In another terminal, start the client
cd client
npm start
```

## Usage

### Opening the AI Assistant

1. Click on the AI Assistant icon in the sidebar (chat bubble icon)
2. The AI assistant panel will slide in from the right

### Using the AI Assistant

1. **Select an Agent**: Choose from Auto, Perplexity, Gemini Pro, Claude, or GPT-4
2. **Ask Questions**: Type your question in the input field
3. **Context Awareness**: The AI knows about your current file and code
4. **Code Changes**: The AI can suggest and apply code changes
5. **File Creation**: The AI can create new files with generated code

### Example Prompts

- "Explain this code"
- "How can I improve this function?"
- "Add error handling to this code"
- "Create a new React component for a todo list"
- "Debug this issue"
- "Optimize this algorithm"
- "Add TypeScript types to this code"

### Agent Selection

- **Auto**: Automatically chooses the best available AI provider
- **Perplexity**: Fast and accurate responses (recommended)
- **Gemini Pro**: Google's advanced AI model
- **Claude**: Anthropic's helpful assistant
- **GPT-4**: OpenAI's most capable model

## Features in Detail

### Context Awareness
The AI assistant automatically knows:
- Your current workspace
- The file you're currently editing
- The code in the current file
- Your project structure

### Code Changes
When the AI suggests code changes, it can:
- Modify existing files
- Create new files
- Provide suggestions for improvements
- Show code diffs

### Suggestions
The AI can provide:
- Code optimization suggestions
- Best practices recommendations
- Security improvements
- Performance enhancements
- Bug fixes

## Troubleshooting

### No AI Providers Available
If you see "No AI providers configured", make sure:
1. You've added API keys to your `.env` file
2. The API keys are valid and have sufficient credits
3. You've restarted the server after adding the keys

### API Errors
If you get API errors:
1. Check that your API keys are correct
2. Ensure you have sufficient credits/quota
3. Check the server console for detailed error messages

### Network Issues
If the AI assistant doesn't respond:
1. Check your internet connection
2. Verify the server is running on port 5000
3. Check browser console for network errors

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and private
- Monitor your API usage to avoid unexpected charges
- Consider using environment variables in production

## Cost Considerations

Different AI providers have different pricing:
- **Perplexity**: Free tier available, then pay-per-use
- **Gemini**: Free tier available, then pay-per-use
- **Claude**: Pay-per-use pricing
- **GPT-4**: Pay-per-use pricing

Start with the free tiers and monitor your usage!

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify your API keys are working
3. Test with a simple prompt first
4. Check the browser console for client-side errors 