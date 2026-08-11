import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const router = express.Router();

let aiClient = null;
function getAI() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

router.post("/generate-form", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-pro-latest",
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
            "type": "text", // "text", "long_text", "multiple_choice", "checkboxes", "dropdown"
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
      },
    });

    let text = response.text;
    text = text
      .replace(/\s*\x60\x60\x60json\n?/g, "")
      .replace(/\n?\x60\x60\x60\s*/g, "")
      .trim();

    if (!text) {
      throw new Error("No response from AI");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Form generation error:", error);
    res.status(500).json({ error: "Failed to generate form" });
  }
});

router.post("/analyze-responses", async (req, res) => {
  try {
    const { form, responses } = req.body;
    if (!form || !responses) {
      return res.status(400).json({ error: "Form and responses are required" });
    }

    const response = await getAI().models.generateContent({
      model: "gemini-pro-latest",
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
      },
    });

    let text = response.text;
    text = text
      .replace(/\s*\x60\x60\x60json\n?/g, "")
      .replace(/\n?\x60\x60\x60\s*/g, "")
      .trim();

    if (!text) {
      throw new Error("No response from AI");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Response analysis error:", error);
    res.status(500).json({ error: "Failed to analyze responses" });
  }
});

router.post("/generate-templates", async (req, res) => {
  try {
    const { topic } = req.body;
    const promptTopic = topic || "general business and personal use";

    const response = await getAI().models.generateContent({
      model: "gemini-pro-latest",
      contents: `You are an expert form creator. Generate 6 form template ideas for: ${promptTopic}.
      
      Output a JSON array of objects with this exact structure:
      [
        {
          "title": "Template Title",
          "description": "Short description of what the form is for",
          "prompt": "A detailed prompt that can be used to generate this form later (e.g. 'Create a feedback form with rating and text questions')"
        }
      ]
      
      Output only the raw JSON array. Do not include markdown formatting like \`\`\`json.
      `,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    text = text
      .replace(/\s*\x60\x60\x60json\n?/g, "")
      .replace(/\n?\x60\x60\x60\s*/g, "")
      .trim();

    if (!text) {
      throw new Error("No response from AI");
    }

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Template generation error:", error);
    res.status(500).json({ error: "Failed to generate templates" });
  }
});

export default router;
