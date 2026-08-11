const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Add activeTab state
content = content.replace(
  'const [isGenerating, setIsGenerating] = useState(false);',
  'const [isGenerating, setIsGenerating] = useState(false);\n  const [activeTab, setActiveTab] = useState("Dashboard");\n  const [searchQuery, setSearchQuery] = useState("");'
);

// 2. Update NavItem usage
const oldNav = `<nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutTemplate} label="Dashboard" active />
          <NavItem icon={FileText} label="My Forms" />
          <NavItem icon={BarChart3} label="Templates" />
          <NavItem icon={Settings} label="Settings" />
        </nav>`;
const newNav = `<nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutTemplate} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={FileText} label="My Forms" active={activeTab === "My Forms"} onClick={() => setActiveTab("My Forms")} />
          <NavItem icon={BarChart3} label="Templates" active={activeTab === "Templates"} onClick={() => setActiveTab("Templates")} />
          <NavItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </nav>`;
content = content.replace(oldNav, newNav);

// 3. Update main content wrapper
const oldMainStart = `<main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">`;

content = content.replace(oldMainStart, oldMainStart + `
        {activeTab === "Dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
`);

// Add filteredForms for searching
const regexSearch = /<input\s+type="text"\s+placeholder="Search forms\.\.\."\s+className="\[\^"\]*"\s*\/>/;
content = content.replace(
  /<input\s+type="text"\s+placeholder="Search forms\.\.\."/,
  `<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search forms..."`
);

content = content.replace(/forms\.map/g, 'forms.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())).map');
content = content.replace(/forms\.length === 0/g, 'forms.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0');
content = content.replace(/forms\.length\.toString\(\)/g, 'forms.length.toString()'); // revert

// Wait, the length replacement might be bad. Let's just fix it by declaring a filteredForms var.
