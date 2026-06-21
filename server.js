const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Backward compatibility check for Node fetch
const fetch = globalThis.fetch || require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8000;

// In-memory store for prompt history
let promptHistory = [];

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for prompt optimization
app.post('/api/enhance', async (req, res) => {
  const { rawText, provider, systemInstruction, temperature } = req.body;

  if (!rawText || !provider || !systemInstruction) {
    return res.status(400).json({ error: { message: "Missing required parameters (rawText, provider, systemInstruction)." } });
  }

  // Parse temperature from request or default to 0.5
  const tempVal = temperature !== undefined ? parseFloat(temperature) : 0.5;

  try {
    let resultText = "";

    if (provider === 'chatgpt') {
      const apiKey = process.env.OPENAI_API_KEY || req.headers['x-openai-key'];
      if (!apiKey) {
        return res.status(400).json({ error: { message: "OpenAI API Key not configured. Please supply it in the client settings modal or server environment variables." } });
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: rawText }
          ],
          temperature: tempVal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `OpenAI returned status ${response.status}`);
      }
      resultText = data.choices[0].message.content.trim();

    } else if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];
      if (!apiKey) {
        return res.status(400).json({ error: { message: "Gemini API Key not configured. Please supply it in the client settings modal or server environment variables." } });
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemInstruction}\n\nUser input to optimize:\n\"${rawText}\"`
            }]
          }],
          generationConfig: {
            temperature: tempVal
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Gemini returned status ${response.status}`);
      }
      resultText = data.candidates[0].content.parts[0].text.trim();

    } else if (provider === 'claude') {
      const apiKey = process.env.ANTHROPIC_API_KEY || req.headers['x-anthropic-key'];
      if (!apiKey) {
        return res.status(400).json({ error: { message: "Anthropic API Key not configured. Please supply it in the client settings modal or server environment variables." } });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4096,
          system: systemInstruction,
          messages: [{ role: 'user', content: rawText }],
          temperature: tempVal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `Anthropic returned status ${response.status}`);
      }
      resultText = data.content[0].text.trim();
    } else {
      return res.status(400).json({ error: { message: `Unsupported provider: ${provider}` } });
    }

    // Save to server history
    const historyItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      rawText,
      provider,
      optimized: resultText,
      temperature: tempVal,
      timestamp: new Date().toISOString()
    };
    promptHistory.unshift(historyItem);
    if (promptHistory.length > 100) {
      promptHistory.pop();
    }

    res.json({ optimized: resultText });

  } catch (error) {
    console.error("Enhance proxy error:", error.message);
    res.status(500).json({ error: { message: error.message } });
  }
});

// GET /api/history - returns last 50 history entries, newest first
app.get('/api/history', (req, res) => {
  res.json(promptHistory.slice(0, 50));
});

// DELETE /api/history/:id - removes a single entry
app.delete('/api/history/:id', (req, res) => {
  const { id } = req.params;
  promptHistory = promptHistory.filter(item => item.id !== id);
  res.json({ success: true });
});

// DELETE /api/history - clears all history
app.delete('/api/history', (req, res) => {
  promptHistory = [];
  res.json({ success: true });
});

// Wildcard fallback to serve index.html for UI SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PromptMaster Dev Server running at http://localhost:${PORT}`);
});
