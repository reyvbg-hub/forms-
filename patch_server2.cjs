const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `app.post("/api/generate-templates", async (req, res) => {
  try {
    const { topic } = req.body;
    const promptTopic = topic || "general business and personal use";

    const response = await getAI().models.generateContent({
      model: "gemini-1.5-flash",
      contents: \`You are an expert form creator. Generate 6 form template ideas for: \${promptTopic}.
      
      Output a JSON array of objects with this exact structure:
      [
        {
          "title": "Template Title",
          "description": "Short description of what the form is for",
          "prompt": "A detailed prompt that can be used to generate this form later (e.g. 'Create a feedback form with rating and text questions')"
        }
      ]
      
      Output only the raw JSON array. Do not include markdown formatting like \\\`\\\`\\\`json.
      \`,
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
    console.error("Template generation error:", error);
    res.status(500).json({ error: "Failed to generate templates" });
  }
});

async function startServer() {`;

content = content.replace('async function startServer() {', newEndpoint);
fs.writeFileSync('server.ts', content);
