const fs = require('fs');
let content = fs.readFileSync('src/pages/Builder.tsx', 'utf8');

// replace title onChange
content = content.replace(
  /onChange=\{\(e\) => setForm\(\{ \.\.\.form, title: e\.target\.value \}\)\}/g,
  `onChange={(e) => { setForm({ ...form, title: e.target.value }); setIsDirty(true); }}`
);

// replace description onChange
content = content.replace(
  /onChange=\{\(e\) => setForm\(\{ \.\.\.form, description: e\.target\.value \}\)\}/g,
  `onChange={(e) => { setForm({ ...form, description: e.target.value }); setIsDirty(true); }}`
);

// also for the title in the header bar
content = content.replace(
  /onChange=\{\(e\) => \{\n\s*const newTitle = e\.target\.value;\n\s*setForm\(\{ \.\.\.form, title: newTitle \}\);\n\s*\}\}/g,
  `onChange={(e) => {\n              const newTitle = e.target.value;\n              setForm({ ...form, title: newTitle });\n              setIsDirty(true);\n            }}`
);

fs.writeFileSync('src/pages/Builder.tsx', content);
