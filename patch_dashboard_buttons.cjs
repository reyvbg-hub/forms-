const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Add deleteDoc and doc imports
content = content.replace('addDoc,', 'addDoc,\n  deleteDoc,\n  doc,');

// Add delete and duplicate functions
const newFuncs = `  const handleDeleteForm = async (formId: string) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteDoc(doc(db, "forms", formId));
      setForms(forms.filter(f => f.id !== formId));
    } catch (error) {
      console.error("Error deleting form", error);
      alert("Failed to delete form.");
    }
  };

  const handleDuplicateForm = async (form: Form) => {
    try {
      const { id, ...formData } = form;
      const newForm = {
        ...formData,
        title: formData.title + " (Copy)",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "draft"
      };
      const docRef = await addDoc(collection(db, "forms"), newForm);
      setForms([{ id: docRef.id, ...newForm } as Form, ...forms]);
    } catch (error) {
      console.error("Error duplicating form", error);
      alert("Failed to duplicate form.");
    }
  };

  const handleCreateNew = () => {`;

content = content.replace('  const handleCreateNew = () => {', newFuncs);

// Replace MoreVertical button with explicit buttons
const oldButtons = `<button className="text-slate-400 hover:text-slate-600 p-1">\n                          <MoreVertical className="w-4 h-4" />\n                        </button>`;
const newButtons = `<button onClick={() => handleDuplicateForm(form)} title="Duplicate" className="text-slate-400 hover:text-blue-600 p-1">\n                          <Copy className="w-4 h-4" />\n                        </button>\n                        <button onClick={() => handleDeleteForm(form.id)} title="Delete" className="text-slate-400 hover:text-red-600 p-1">\n                          <Trash2 className="w-4 h-4" />\n                        </button>`;
content = content.replace(oldButtons, newButtons);
content = content.replace('<button className="text-slate-400 hover:text-slate-600 p-1">                          <MoreVertical className="w-4 h-4" />                        </button>', newButtons);
// Also just in case formatting is weird:
content = content.replace(/<button className="text-slate-400 hover:text-slate-600 p-1">\s*<MoreVertical className="w-4 h-4" \/>\s*<\/button>/g, newButtons);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
