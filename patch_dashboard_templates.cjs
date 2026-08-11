const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Add states for templates
const stateRegex = /const \[isGenerating, setIsGenerating\] = useState\(false\);/;
const stateReplacement = `const [isGenerating, setIsGenerating] = useState(false);
  const [templateTopic, setTemplateTopic] = useState("");
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
  const [templates, setTemplates] = useState<{title: string, description: string, prompt: string}[]>([]);`;
content = content.replace(stateRegex, stateReplacement);

// 2. Add function to generate templates
const funcRegex = /const generateForm = async \(\) => \{/;
const funcReplacement = `const generateTemplates = async () => {
    setIsGeneratingTemplates(true);
    try {
      const response = await fetch("/api/generate-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: templateTopic }),
      });
      if (!response.ok) throw new Error("Failed to generate templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error generating templates", error);
      alert("Failed to generate templates. Please try again.");
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  const useTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setIsModalOpen(true);
  };

  const generateForm = async () => {`;
content = content.replace(funcRegex, funcReplacement);

// 3. Update the UI for Templates tab
const templatesUiRegex = /\{activeTab === "Templates" && \([\s\S]*?We are working on a library of pre-built templates to get you[\s\S]*?started even faster\.\s*<\/p>\s*<\/div>\s*<\/div>\s*\)\}/;
const templatesUiReplacement = `{activeTab === "Templates" && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">AI Templates</h1>
            <div className="mb-8 bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Generate Custom Templates</h3>
              <p className="text-slate-500 mb-4 text-sm">Tell us what kind of forms you need, and our AI will generate custom templates for you.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={templateTopic}
                  onChange={(e) => setTemplateTopic(e.target.value)}
                  placeholder="e.g. HR onboarding, Event feedback, Education..."
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && generateTemplates()}
                />
                <button
                  onClick={generateTemplates}
                  disabled={isGeneratingTemplates}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center min-w-[140px]"
                >
                  {isGeneratingTemplates ? 'Generating...' : 'Generate Ideas'}
                </button>
              </div>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <LayoutTemplate className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{template.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 flex-1">{template.description}</p>
                    <button
                      onClick={() => useTemplate(template.prompt)}
                      className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 rounded-lg transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No templates generated</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Enter a topic above to generate AI-powered form templates tailored to your needs.</p>
              </div>
            )}
          </div>
        )}`;
content = content.replace(templatesUiRegex, templatesUiReplacement);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
