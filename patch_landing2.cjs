const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const regex = /<button \s*onClick=\{handleGetStarted\}\s*className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"\s*>\s*Create a Form <ArrowRight className="w-5 h-5" \/>\s*<\/button>/m;

code = code.replace(regex, `
          <button 
             onClick={handleGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Sign in with Google <ArrowRight className="w-5 h-5" />
          </button>
          <button 
             onClick={async () => { 
               try {
                 await signInAnonymously();
                 navigate('/dashboard');
               } catch(e) { console.error(e); } 
             }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm hover:-translate-y-0.5"
          >
            Continue as Guest
          </button>`);

const regex2 = /<button \s*onClick=\{handleGetStarted\}\s*className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"\s*>\s*Create your first form in seconds\s*<\/button>/m;

code = code.replace(regex2, `
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
            >
              Sign in with Google
            </button>
            <button 
              onClick={async () => { 
                try {
                  await signInAnonymously();
                  navigate('/dashboard');
                } catch(e) { console.error(e); } 
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
            >
              Continue as Guest
            </button>
          </div>
`);

fs.writeFileSync('src/pages/Landing.tsx', code);
