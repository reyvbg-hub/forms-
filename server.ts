import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/generate-form", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are an expert form creator. Given the user prompt, generate a structured form in JSON format.
      
      User prompt: ${prompt}
      
      The JSON must follow this exact structure:
      {
        "title": "Form Title",
        "description": "Form Description",
        "theme": "light",
        "questions": [
          {
            "id": "q1",
            "type": "text", // "text", "long_text", "multiple_choice", "checkboxes", "dropdown", "rating", "date", "email", "phone"
            "title": "Question Title",
            "description": "Optional description",
            "required": true,
            "options": ["Option 1", "Option 2"] // Only include this for multiple_choice, checkboxes, dropdown
          }
        ]
      }
      
      Output only the raw JSON. Do not include markdown formatting like \`\`\`json.
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Form generation error:", error);
    res.status(500).json({ error: "Failed to generate form" });
  }
});

app.post("/api/analyze-responses", async (req, res) => {
  try {
    const { form, responses } = req.body;

    if (!form || !responses) {
      return res.status(400).json({ error: "Form and responses are required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are a data analyst. Analyze these form responses and provide insights.
      
      Form definition: ${JSON.stringify(form)}
      Responses: ${JSON.stringify(responses)}
      
      Output a JSON object with this exact structure:
      {
        "summary": "Short overview of the responses",
        "keyInsights": ["Insight 1", "Insight 2"],
        "commonAnswers": ["Common 1", "Common 2"],
        "sentiment": "positive", // "positive", "neutral", "negative", "mixed"
        "recommendations": ["Rec 1", "Rec 2"]
      }
      
      Output only the raw JSON. Do not include markdown formatting like \`\`\`json.
      `,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Response analysis error:", error);
    res.status(500).json({ error: "Failed to analyze responses" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
