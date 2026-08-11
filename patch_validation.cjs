const fs = require('fs');
let content = fs.readFileSync('src/pages/FormViewer.tsx', 'utf8');

const oldValidation = `const missingRequired = form.questions.filter(q => q.required && !answers[q.id]);`;
const newValidation = `const missingRequired = form.questions.filter(q => {
      if (!q.required) return false;
      const val = answers[q.id];
      if (val === undefined || val === null || val === '') return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });`;

content = content.replace(oldValidation, newValidation);

fs.writeFileSync('src/pages/FormViewer.tsx', content);
