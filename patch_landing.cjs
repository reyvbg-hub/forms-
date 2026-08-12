const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  "const { user, signInWithGoogle } = useAuth();",
  "const { user, signInWithGoogle, signInAnonymously } = useAuth();"
);

code = code.replace(
  `        setAuthError("Login failed. If you are viewing this inside the AI Studio preview, please open the app in a new tab to sign in.");`,
  `        setAuthError("Google Sign-In requires third-party cookies or an authorized domain. Please use 'Continue as Guest' below instead.");`
);

code = code.replace(
  `          <button \n             onClick={handleGetStarted}\n            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"\n          >\n            Create a Form <ArrowRight className="w-5 h-5" />\n          </button>`,
  `          <button \n             onClick={handleGetStarted}\n            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"\n          >\n            Sign in with Google <ArrowRight className="w-5 h-5" />\n          </button>\n          <button \n             onClick={async () => { \n               try {\n                 await signInAnonymously();\n                 navigate('/dashboard');\n               } catch(e) { console.error(e); } \n             }}\n            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm"\n          >\n            Continue as Guest\n          </button>`
);

code = code.replace(
  `            <button \n               onClick={handleGetStarted}\n              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"\n            >\n              Get Started\n            </button>`,
  `            <button \n               onClick={handleGetStarted}\n              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"\n            >\n              Sign In\n            </button>`
);

fs.writeFileSync('src/pages/Landing.tsx', code);
