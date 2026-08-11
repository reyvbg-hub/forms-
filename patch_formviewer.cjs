const fs = require('fs');
let content = fs.readFileSync('src/pages/FormViewer.tsx', 'utf8');

// Add error state
content = content.replace(
  /const \[submitting, setSubmitting\] = useState\(false\);/,
  `const [submitting, setSubmitting] = useState(false);\n  const [error, setError] = useState<string | null>(null);`
);

// Replace alerts with setError
content = content.replace(
  /alert\("Please fill out all required fields\."\);/,
  `setError("Please fill out all required fields.");`
);

content = content.replace(
  /alert\("Failed to submit form\. Please try again\."\);/,
  `setError("Failed to submit form. Please try again.");`
);

content = content.replace(
  /<form onSubmit=\{handleSubmit\} className="space-y-6">/,
  `{error && (\n          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium mb-6">\n            {error}\n          </div>\n        )}\n        <form onSubmit={handleSubmit} className="space-y-6">`
);

fs.writeFileSync('src/pages/FormViewer.tsx', content);
