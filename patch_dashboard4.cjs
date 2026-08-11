const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The main element starts around `<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">`
const mainRegex = /<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">[\s\S]*?\{activeTab === "Templates"/;

const newMainContent = `<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        {activeTab === "Dashboard" && (
          <div className="animate-in fade-in duration-300">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Good morning, {user?.displayName?.split(" ")[0] || "User"}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Here's what's happening with your forms today.
                </p>
              </div>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New Form
              </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard title="Total Forms" value={forms.length.toString()} />
              <StatCard
                title="Published"
                value={forms
                  .filter((f) => f.status === "published")
                  .length.toString()}
              />
              <StatCard title="Total Responses" value="---" />
              <StatCard title="Completion Rate" value="---" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Recent Forms</h2>
              <button onClick={() => setActiveTab("My Forms")} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl border border-slate-200 h-20"
                  />
                ))}
              </div>
            ) : forms.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  No forms yet
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  You haven't created any forms. Click the button below to
                  generate your first form with AI.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Create your first form
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Form Name
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {forms.slice(0, 5).map((form) => (
                      <tr
                        key={form.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {form.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {form.questions?.length || 0} questions
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span
                            className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                              form.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }\`}
                          >
                            {form.status === "published" ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(\`/builder/\${form.id}\`)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1"
                            >
                              Edit
                            </button>
                            {form.status === "published" && (
                              <button
                                onClick={() =>
                                  navigate(\`/analytics/\${form.id}\`)
                                }
                                className="text-slate-600 hover:text-slate-900 px-2 py-1 hidden sm:block"
                              >
                                Results
                              </button>
                            )}
                            <button
                              onClick={() => handleDuplicateForm(form)}
                              title="Duplicate"
                              className="text-slate-400 hover:text-blue-600 p-1"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteForm(form.id)}
                              title="Delete"
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "My Forms" && (
          <div className="animate-in fade-in duration-300">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl font-bold text-slate-900">
                My Forms
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forms..."
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center justify-center w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New Form
                </button>
              </div>
            </header>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-xl border border-slate-200 h-20"
                  />
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  No forms found
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  {searchQuery ? "Try adjusting your search query." : "You haven't created any forms yet."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreateNew}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
                  >
                    Create your first form
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Form Name
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredForms.map((form) => (
                      <tr
                        key={form.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {form.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {form.questions?.length || 0} questions
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span
                            className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium \${
                              form.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }\`}
                          >
                            {form.status === "published" ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(\`/builder/\${form.id}\`)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1"
                            >
                              Edit
                            </button>
                            {form.status === "published" && (
                              <button
                                onClick={() =>
                                  navigate(\`/analytics/\${form.id}\`)
                                }
                                className="text-slate-600 hover:text-slate-900 px-2 py-1 hidden sm:block"
                              >
                                Results
                              </button>
                            )}
                            <button
                              onClick={() => handleDuplicateForm(form)}
                              title="Duplicate"
                              className="text-slate-400 hover:text-blue-600 p-1"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteForm(form.id)}
                              title="Delete"
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "Templates"`;

content = content.replace(mainRegex, newMainContent);
fs.writeFileSync('src/pages/Dashboard.tsx', content);
