const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Reset to previous just in case
// Actually, let's just use string replacement carefully.

// Let's replace the whole Dashboard component starting from `return (`.
// First, we need to extract the parts before `return (`
const returnIndex = content.indexOf('return (');
const beforeReturn = content.substring(0, returnIndex);
const afterReturn = content.substring(returnIndex);

// Update NavItem definition first
let newContent = content.replace(
  `function NavItem({\n  icon: Icon,\n  label,\n  active = false,\n}: {\n  icon: any;\n  label: string;\n  active?: boolean;\n}) {\n  return (\n    <a\n      href="#"`,
  `function NavItem({\n  icon: Icon,\n  label,\n  active = false,\n  onClick,\n}: {\n  icon: any;\n  label: string;\n  active?: boolean;\n  onClick?: () => void;\n}) {\n  return (\n    <button\n      onClick={onClick}\n      className={\`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors \${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}\`}\n    >\n      <Icon\n        className={\`w-4 h-4 \${active ? "text-blue-600" : "text-slate-400"}\`}\n      />\n      {label}\n    </button>\n  );\n}\n\n/*`
);

// We'll just append `*/` after the old NavItem component.
newContent = newContent.replace(/<\/a>\n  \);\n}/, '</a>\n  );\n}\n*/');

// Now, replace the state
newContent = newContent.replace(
  'const [isGenerating, setIsGenerating] = useState(false);',
  'const [isGenerating, setIsGenerating] = useState(false);\n  const [activeTab, setActiveTab] = useState("Dashboard");\n  const [searchQuery, setSearchQuery] = useState("");\n\n  const filteredForms = forms.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));'
);

// Now NavItems in Dashboard
newContent = newContent.replace(
  `<NavItem icon={LayoutTemplate} label="Dashboard" active />\n          <NavItem icon={FileText} label="My Forms" />\n          <NavItem icon={BarChart3} label="Templates" />\n          <NavItem icon={Settings} label="Settings" />`,
  `<NavItem icon={LayoutTemplate} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />\n          <NavItem icon={FileText} label="My Forms" active={activeTab === "My Forms"} onClick={() => setActiveTab("My Forms")} />\n          <NavItem icon={BarChart3} label="Templates" active={activeTab === "Templates"} onClick={() => setActiveTab("Templates")} />\n          <NavItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />`
);

fs.writeFileSync('src/pages/Dashboard.tsx', newContent);
