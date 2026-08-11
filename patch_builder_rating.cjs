const fs = require('fs');
let content = fs.readFileSync('src/pages/Builder.tsx', 'utf8');

content = content.replace('<option value="email">Email</option>', '<option value="email">Email</option>\n              <option value="rating">Rating</option>');

fs.writeFileSync('src/pages/Builder.tsx', content);
