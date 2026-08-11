const fs = require('fs');
let content = fs.readFileSync('src/pages/Builder.tsx', 'utf8');

// Add useDebounce or just a custom hook for debouncing save
const debouncedSaveCode = `  const [isDirty, setIsDirty] = useState(false);

  const saveForm = useCallback(
    async (updatedForm: Form) => {
      if (!id) return;
      setSaving(true);
      try {
        const { id: _, ...dataToSave } = updatedForm;
        const formRef = doc(db, "forms", id);
        await updateDoc(formRef, {
          ...dataToSave,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error("Error saving form", error);
      } finally {
        setTimeout(() => setSaving(false), 500);
      }
    },
    [id]
  );

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !form) return;
    
    const timeout = setTimeout(() => {
      saveForm(form);
      setIsDirty(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [form, isDirty, saveForm]);`;

content = content.replace(/  const saveForm = useCallback\([\s\S]*?,\n    \[id\],\n  \);/, debouncedSaveCode);

// update function calls to only setForm and setIsDirty
content = content.replace(/setForm\(updatedForm\);\s*saveForm\(updatedForm\);/g, 'setForm(updatedForm);\n    setIsDirty(true);');
content = content.replace(/await saveForm\(updatedForm\);/g, 'setForm(updatedForm);\n    setIsDirty(true);\n    saveForm(updatedForm); // Force immediate save');

// Wait, the handleGenerate had:
// await saveForm(updatedForm);
// setAiPrompt("");
// This will become:
// setForm(updatedForm);
// setIsDirty(true);
// saveForm(updatedForm); // Force immediate save
// setAiPrompt("");

// Also in publishForm:
// await saveForm(updatedForm);
// setShowShareModal(true);
// This becomes:
// setForm(updatedForm);
// setIsDirty(true);
// saveForm(updatedForm); // Force immediate save
// setShowShareModal(true);

fs.writeFileSync('src/pages/Builder.tsx', content);
