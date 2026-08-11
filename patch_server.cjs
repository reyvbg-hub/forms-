const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /const ai = new GoogleGenAI\(\{ apiKey: process.env.GEMINI_API_KEY \}\);/;
const newCode = `let aiClient = null;
function getAI() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}`;

content = content.replace(regex, newCode);
content = content.replace(/await ai\.models\.generateContent/g, "await getAI().models.generateContent");

fs.writeFileSync('server.ts', content);
