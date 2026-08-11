const fs = require('fs');
let content = fs.readFileSync('src/pages/FormViewer.tsx', 'utf8');

const ratingCode = `
              {q.type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAnswers({...answers, [q.id]: num})}
                      className={\`w-10 h-10 rounded-full flex items-center justify-center border font-medium transition-colors \${answers[q.id] === num ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'}\`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
`;

content = content.replace("            </div>\n          ))}", ratingCode + "            </div>\n          ))}");

fs.writeFileSync('src/pages/FormViewer.tsx', content);
