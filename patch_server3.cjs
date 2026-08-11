const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /const text = response\.text;/g,
  `let text = response.text;\n    text = text.replace(/\\s*\\x60\\x60\\x60json\\n?/g, "").replace(/\\n?\\x60\\x60\\x60\\s*/g, "").trim();`
);

fs.writeFileSync('server.ts', content);
