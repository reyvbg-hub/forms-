const fs = require('fs');
let code = fs.readFileSync('api.ts', 'utf8');

code = code.replace(
  `res.status(500).json({ error: "Failed to generate form" });`,
  `res.status(500).json({ error: "Failed to generate form", details: error.message, stack: error.stack });`
);

fs.writeFileSync('api.ts', code);
