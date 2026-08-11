const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const mainStartRegex = /<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">/;
const mainContentWrapperStart = `<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {(activeTab === "Dashboard" || activeTab === "My Forms") && (
          <div className="animate-in fade-in duration-300">`;

content = content.replace(mainStartRegex, mainContentWrapperStart);

// Need to close the wrapper before `</main>` and add Templates and Settings
const mainEndRegex = /<\/main>/;
const mainContentWrapperEnd = `          </div>
        )}
        
        {activeTab === "Templates" && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Templates</h1>
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Templates coming soon</h3>
              <p className="text-slate-500 max-w-sm mx-auto">We are working on a library of pre-built templates to get you started even faster.</p>
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>
            <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="text" disabled value={user?.email || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                  <input type="text" disabled value={user?.uid || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-500 text-sm font-mono" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>`;

content = content.replace(mainEndRegex, mainContentWrapperEnd);

// Fix the search query implementation
content = content.replace(
  /<input\s+type="text"\s+placeholder="Search forms\.\.\."\s+className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"\s*\/>/,
  `<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search forms..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />`
);

content = content.replace(/forms\.length === 0/g, 'filteredForms.length === 0');
content = content.replace(/forms\.map\(\(form\)/g, 'filteredForms.map((form)');

fs.writeFileSync('src/pages/Dashboard.tsx', content);
