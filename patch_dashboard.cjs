const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace handleCreateNew
const oldFuncRegex = /const handleCreateNew = async \(\) => \{[\s\S]*?navigate\(`\/builder\/\$\{docRef\.id\}`\);\s*\}\s*catch\s*\(error\)\s*\{\s*console\.error\("Error (?:creating|fetching)(?: new)? forms?", error\);\s*\}\s*\};/;

const newFunc = `  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const generateForm = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (!response.ok) throw new Error('Failed to generate form');
      
      const generatedData = await response.json();
      
      const newForm = {
        ownerId: user?.uid,
        title: generatedData.title || 'Untitled Form',
        description: generatedData.description || '',
        theme: generatedData.theme || 'light',
        status: 'draft',
        questions: generatedData.questions || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const docRef = await addDoc(collection(db, 'forms'), newForm);
      navigate(\`/builder/\${docRef.id}\`);
    } catch (error) {
      console.error("Error generating form", error);
      alert('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
      setIsModalOpen(false);
      setPrompt("");
    }
  };`;

content = content.replace(oldFuncRegex, newFunc);

// Inject Modal at the end of the return statement
const modalCode = `      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create a new form with AI</h2>
            <p className="text-slate-500 text-sm mb-6">Describe the form you want to create, and our AI will generate the questions for you.</p>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A feedback form for my new coffee shop with rating out of 5..."
              className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-6 text-sm"
              disabled={isGenerating}
            />
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={generateForm}
                disabled={!prompt || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Form'
                )}
              </button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace('    </div>\n  );\n}', `      {/* Create Form Modal */}\n${modalCode}\n    </div>\n  );\n}`);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
