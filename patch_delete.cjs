const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /if \(\!window\.confirm\("Are you sure you want to delete this form\?"\)\) return;/g,
  `// Removed window.confirm because of iframe restrictions`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
