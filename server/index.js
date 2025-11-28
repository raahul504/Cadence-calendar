// server/index.js - Simple Gemini Proxy
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// CORS - restrict to your Vercel domain in production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Cadence Gemini Proxy",
    geminiConfigured: !!genAI 
  });
});

// Simple proxy endpoint - just forwards to Gemini
app.post("/api/chat", async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ 
        error: "Gemini API not configured on server" 
      });
    }

    const { history, message, generationConfig } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: "Invalid message format" 
      });
    }

    // Forward to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
      history: history || [],
      generationConfig: generationConfig || {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ 
      success: true, 
      response 
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ 
      error: "Failed to get AI response",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Cadence Gemini Proxy running on port ${PORT}`);
  console.log(`📡 Gemini API: ${genAI ? 'Configured ✅' : 'Missing ❌'}`);
});