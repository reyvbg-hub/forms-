const fs = require('fs');
let content = fs.readFileSync('src/pages/FormViewer.tsx', 'utf8');

const regex = /\/\/ Basic validation[\s\S]*?if \(missingRequired.length > 0\) \{/;
const newCode = `// Basic validation
    const missingRequired = form.questions.filter((q) => {
      if (!q.required) return false;
      const val = answers[q.id];
      if (val === undefined || val === null || val === '') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingRequired.length > 0) {`;

content = content.replace(regex, newCode);
fs.writeFileSync('src/pages/FormViewer.tsx', content);
