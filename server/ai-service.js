const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    this.providers = {
      perplexity: {
        name: 'Perplexity',
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: 'https://api.perplexity.ai/chat/completions',
        model: 'sonar-pro'
      },
      gemini: {
        name: 'Gemini',
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
        model: 'gemini-1.5-flash'
      },
      cohere: {
        name: 'Cohere',
        apiKey: process.env.COHERE_API_KEY,
        baseURL: 'https://api.cohere.ai/v1/chat',
        model: 'command-r-plus'
      },
      groq: {
        name: 'Groq',
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama3-70b-8192'
      }
    };
  }

  async callPerplexity(message, context) {
    try {
      const response = await axios.post(this.providers.perplexity.baseURL, {
        model: this.providers.perplexity.model,
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(context)
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.providers.perplexity.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        codeChanges: this.extractCodeChanges(response.data.choices[0].message.content),
        suggestions: this.extractSuggestions(response.data.choices[0].message.content)
      };
    } catch (error) {
      console.error('Perplexity API error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to get response from Perplexity'
      };
    }
  }

  async callGemini(message, context) {
    try {
      const response = await axios.post(
        `${this.providers.gemini.baseURL}?key=${this.providers.gemini.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: this.buildSystemPrompt(context) + '\n\nUser: ' + message
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        }
      );

      return {
        success: true,
        response: response.data.candidates[0].content.parts[0].text,
        codeChanges: this.extractCodeChanges(response.data.candidates[0].content.parts[0].text),
        suggestions: this.extractSuggestions(response.data.candidates[0].content.parts[0].text)
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to get response from Gemini'
      };
    }
  }

  async callCohere(message, context) {
    try {
      const response = await axios.post(
        this.providers.cohere.baseURL,
        {
          message: message,
          model: this.providers.cohere.model,
          preamble: this.buildSystemPrompt(context),
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.cohere.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        response: response.data.text,
        codeChanges: this.extractCodeChanges(response.data.text),
        suggestions: this.extractSuggestions(response.data.text)
      };
    } catch (error) {
      console.error('Cohere API error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to get response from Cohere'
      };
    }
  }

  async callGroq(message, context) {
    try {
      const response = await axios.post(
        this.providers.groq.baseURL,
        {
          model: this.providers.groq.model,
          messages: [
            {
              role: 'system',
              content: this.buildSystemPrompt(context)
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.providers.groq.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        response: response.data.choices[0].message.content,
        codeChanges: this.extractCodeChanges(response.data.choices[0].message.content),
        suggestions: this.extractSuggestions(response.data.choices[0].message.content)
      };
    } catch (error) {
      console.error('Groq API error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Failed to get response from Groq'
      };
    }
  }

  buildSystemPrompt(context) {
    const { currentFile, currentCode, workspace } = context;
    
    let prompt = `You are an intelligent AI coding assistant, similar to GitHub Copilot or Cursor's AI. You help developers with code analysis, suggestions, and improvements.

Current context:
- Workspace: ${workspace}
- Current file: ${currentFile || 'None'}
${currentCode ? `- Current code:\n\`\`\`\n${currentCode}\n\`\`\`` : ''}

Your capabilities:
1. Analyze code and provide suggestions
2. Explain code concepts and patterns
3. Suggest improvements and optimizations
4. Help with debugging issues
5. Provide code examples and snippets
6. Answer questions about programming languages and frameworks
7. Automatically implement code changes in the user's directory

IMPORTANT: When asked to create or implement any code, you MUST ALWAYS include a code-changes section that specifies the files to create or modify. This is required for automatic file creation.

When suggesting code changes, use this format:
\`\`\`code-changes
[
  {"type": "create", "file": "filename.js", "newContent": "// Full content of the file here"},
  {"type": "modify", "file": "existing-file.js", "newContent": "// Updated content here"}
]
\`\`\`

Examples:
1. If asked to "create a simple HTML/CSS chatbot", you MUST include:
\`\`\`code-changes
[
  {"type": "create", "file": "chatbot.html", "newContent": "<!DOCTYPE html>\\n<html>...full HTML content..."},
  {"type": "create", "file": "chatbot.css", "newContent": "/* Full CSS content */"}
]
\`\`\`

2. If asked to "add a button to my page", you MUST include:
\`\`\`code-changes
[{"type": "modify", "file": "index.html", "newContent": "...updated HTML with button..."}]
\`\`\`

When providing suggestions, use this format:
\`\`\`suggestions
["Suggestion 1", "Suggestion 2", "Suggestion 3"]
\`\`\`

Be helpful, concise, and focus on practical solutions. Always consider the current file context when providing suggestions. When asked to implement code, ALWAYS create or modify files as needed using the code-changes format.`;

    return prompt;
  }

  extractCodeChanges(response) {
    // First try to extract from code-changes section
    const codeChangesMatch = response.match(/```code-changes\n([\s\S]*?)\n```/);
    if (codeChangesMatch) {
      try {
        return JSON.parse(codeChangesMatch[1]);
      } catch (error) {
        console.error('Failed to parse code changes:', error);
      }
    }
    
    // Fallback: Extract code blocks and create files based on language hints
    const codeBlocks = [];
    const codeBlockRegex = /```([\w-]+)?\s*\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1] ? match[1].trim().toLowerCase() : '';
      const code = match[2].trim();
      
      if (code && language) {
        // Skip code-changes and suggestions blocks
        if (language === 'code-changes' || language === 'suggestions') {
          continue;
        }
        
        codeBlocks.push({
          language,
          code
        });
      }
    }
    
    // Convert code blocks to file changes
    if (codeBlocks.length > 0) {
      return this.convertCodeBlocksToFileChanges(codeBlocks, response);
    }
    
    return [];
  }
  
  convertCodeBlocksToFileChanges(codeBlocks, fullResponse) {
    const changes = [];
    const fileExtensionMap = {
      'html': 'html',
      'css': 'css',
      'javascript': 'js',
      'js': 'js',
      'typescript': 'ts',
      'ts': 'ts',
      'python': 'py',
      'py': 'py',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'c++': 'cpp',
      'csharp': 'cs',
      'cs': 'cs',
      'php': 'php',
      'ruby': 'rb',
      'go': 'go',
      'rust': 'rs',
      'swift': 'swift',
      'kotlin': 'kt',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yml',
      'markdown': 'md',
      'md': 'md',
      'sql': 'sql',
      'bash': 'sh',
      'sh': 'sh',
      'plaintext': 'txt',
      'txt': 'txt'
    };
    
    // Try to extract file names from the response text
    const fileNameRegex = /(?:create|make|generate|implement)(?:\s+a|\s+an|\s+the)?(?:\s+new)?\s+(?:file\s+(?:called|named))?\s*["`']?([a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9]+)["`']?/gi;
    const fileNames = [];
    let fileNameMatch;
    
    while ((fileNameMatch = fileNameRegex.exec(fullResponse)) !== null) {
      fileNames.push(fileNameMatch[1]);
    }
    
    // Process each code block
    codeBlocks.forEach((block, index) => {
      let fileName = '';
      
      // Try to use extracted file name if available
      if (fileNames[index]) {
        fileName = fileNames[index];
      } else {
        // Generate file name based on language
        const ext = fileExtensionMap[block.language] || 'txt';
        fileName = `file${index + 1}.${ext}`;
        
        // Special case for HTML/CSS/JS combinations
        if (codeBlocks.length <= 3) {
          if (block.language === 'html') fileName = 'index.html';
          else if (block.language === 'css') fileName = 'styles.css';
          else if (block.language === 'javascript' || block.language === 'js') fileName = 'script.js';
        }
      }
      
      changes.push({
        type: 'create',
        file: fileName,
        newContent: block.code
      });
    });
    
    return changes;
  }

  extractSuggestions(response) {
    const suggestionsMatch = response.match(/```suggestions\n([\s\S]*?)\n```/);
    if (suggestionsMatch) {
      try {
        return JSON.parse(suggestionsMatch[1]);
      } catch (error) {
        console.error('Failed to parse suggestions:', error);
        return [];
      }
    }
    return [];
  }

  async processMessage(message, agent, context) {
    // Remove the code-changes and suggestions sections from the response
    const cleanResponse = (response) => {
      return response
        .replace(/```code-changes\n[\s\S]*?\n```/g, '')
        .replace(/```suggestions\n[\s\S]*?\n```/g, '')
        .trim();
    };

    try {
      let result;
      
      switch (agent) {
        case 'perplexity':
          if (!this.providers.perplexity.apiKey) {
            return { success: false, error: 'Perplexity API key not configured' };
          }
          result = await this.callPerplexity(message, context);
          break;
        case 'gemini':
          if (!this.providers.gemini.apiKey) {
            return { success: false, error: 'Gemini API key not configured' };
          }
          result = await this.callGemini(message, context);
          break;
        case 'cohere':
          if (!this.providers.cohere.apiKey) {
            return { success: false, error: 'Cohere API key not configured' };
          }
          result = await this.callCohere(message, context);
          break;
        case 'groq':
          if (!this.providers.groq.apiKey) {
            return { success: false, error: 'Groq API key not configured' };
          }
          result = await this.callGroq(message, context);
          break;
        case 'auto':
        default:
          // Try providers in order: Perplexity, Gemini, Cohere, Groq
          const providers = ['perplexity', 'gemini', 'cohere', 'groq'];
          for (const provider of providers) {
            if (this.providers[provider].apiKey) {
              const methodName = `call${provider.charAt(0).toUpperCase()}${provider.slice(1)}`;
              result = await this[methodName](message, context);
              if (result.success) break;
            }
          }
          if (!result || !result.success) {
            return { success: false, error: 'No AI providers configured. Please add API keys to your environment variables.' };
          }
          break;
      }

      if (result.success) {
        result.response = cleanResponse(result.response);
      }

      return result;
    } catch (error) {
      console.error('AI service error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while processing your request'
      };
    }
  }

  getAvailableProviders() {
    const available = [];
    for (const [key, provider] of Object.entries(this.providers)) {
      if (provider.apiKey) {
        available.push({
          id: key,
          name: provider.name,
          model: provider.model
        });
      }
    }
    return available;
  }
}

module.exports = new AIService();