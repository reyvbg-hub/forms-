import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Form, Question, QuestionType } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowLeft,
  Wand2,
  Plus,
  Eye,
  Share,
  CheckCircle2,
  GripVertical,
  Trash2,
  X,
  Copy,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QRCodeSVG } from "qrcode.react";

export default function Builder() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!id || !user) return;
    const loadForm = async () => {
      try {
        const docRef = doc(db, "forms", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
          setForm({ id: docSnap.id, ...docSnap.data() } as Form);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading form", error);
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [id, user, navigate]);

  const [isDirty, setIsDirty] = useState(false);

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
    [id],
  );

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || !form) return;

    const timeout = setTimeout(() => {
      saveForm(form);
      setIsDirty(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [form, isDirty, saveForm]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || !form) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const generatedData = await res.json();

      const updatedForm = {
        ...form,
        title: generatedData.title || form.title,
        description: generatedData.description || form.description,
        questions: (generatedData.questions || []).map((q: any, index: number) => ({
          ...q,
          id: uuidv4(),
          order: index,
        })),
      };
      setForm(updatedForm);
      setIsDirty(true);
      saveForm(updatedForm); // Force immediate save
      setAiPrompt("");
    } catch (error) {
      console.error(error);
      alert("Failed to generate form. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && form) {
      const oldIndex = form.questions.findIndex((q) => q.id === active.id);
      const newIndex = form.questions.findIndex((q) => q.id === over?.id);
      const moved = arrayMove(form.questions, oldIndex, newIndex) as Question[];
      const newQuestions = moved.map((q, i) => ({ ...q, order: i }));
      const updatedForm = { ...form, questions: newQuestions };
      setForm(updatedForm);
      setIsDirty(true);
    }
  };

  const addQuestion = () => {
    if (!form) return;
    const newQ: Question = {
      id: uuidv4(),
      type: "text",
      title: "New Question",
      required: false,
      order: form.questions.length,
    };
    const updatedForm = { ...form, questions: [...form.questions, newQ] };
    setForm(updatedForm);
    setIsDirty(true);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    if (!form) return;
    const updatedForm = {
      ...form,
      questions: form.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q,
      ),
    };
    setForm(updatedForm);
    setIsDirty(true);
  };

  const deleteQuestion = (id: string) => {
    if (!form) return;
    const updatedForm = {
      ...form,
      questions: form.questions.filter((q) => q.id !== id),
    };
    setForm(updatedForm);
    setIsDirty(true);
  };

  const publishForm = async () => {
    if (!form) return;
    const updatedForm = {
      ...form,
      status: "published" as const,
      publishedAt: Date.now(),
    };
    setForm(updatedForm);
    setIsDirty(true);
    saveForm(updatedForm); // Force immediate save
    setShowShareModal(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!form) return null;

  const publicUrl = `${window.location.origin}/f/${form.id}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setForm({ ...form, title: newTitle });
              setIsDirty(true);
            }}
            onBlur={() => saveForm(form)}
            className="text-lg font-bold text-slate-900 border-none outline-none focus:ring-0 bg-transparent px-2 w-64 truncate"
          />
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={() => navigate(`/f/${form.id}`)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </button>
          {form.status === "published" && (
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              title="Share"
            >
              <Share className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={publishForm}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              form.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {form.status === "published" ? "Published" : "Publish"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8">
        {/* AI Generator Input */}
        {form.questions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Wand2 className="w-24 h-24 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 relative z-10">
              Describe the form you want to create
            </h2>
            <p className="text-slate-500 text-sm mb-6 relative z-10">
              Let AI build it for you instantly.
            </p>

            <div className="relative z-10">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Create a registration form for a football tournament with player details..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !aiPrompt.trim()}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                {generating ? (
                  "Generating..."
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Generate Form
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Form Title Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4 border-t-8 border-t-blue-600">
          <input
            type="text"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setIsDirty(true);
            }}
            onBlur={() => saveForm(form)}
            placeholder="Form Title"
            className="w-full text-3xl font-bold text-slate-900 border-none outline-none focus:ring-0 mb-2"
          />
          <textarea
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value });
              setIsDirty(true);
            }}
            onBlur={() => saveForm(form)}
            placeholder="Form description"
            className="w-full text-slate-600 border-none outline-none focus:ring-0 resize-none"
            rows={2}
          />
        </div>

        {/* Questions List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={form.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {form.questions.map((q) => (
                <SortableQuestion
                  key={q.id}
                  question={q}
                  update={(updates) => updateQuestion(q.id, updates)}
                  remove={() => deleteQuestion(q.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-8 flex justify-center">
          <button
            onClick={addQuestion}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Share Form</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-4">
                  <QRCodeSVG value={publicUrl} size={150} />
                </div>
                <p className="text-sm text-slate-500">
                  Scan QR to fill out form
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Form Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      alert("Copied to clipboard!");
                    }}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg flex-shrink-0"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SortableQuestionProps = {
  question: Question;
  update: (u: Partial<Question>) => void;
  remove: () => void;
};

const SortableQuestion: React.FC<SortableQuestionProps> = ({
  question,
  update,
  remove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm border ${isDragging ? "border-blue-500 shadow-md" : "border-slate-200"}`}
    >
      <div className="flex">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="w-8 flex flex-col items-center justify-center border-r border-slate-100 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <div className="p-6 flex-1">
          <div className="flex items-start gap-4 mb-4">
            <input
              type="text"
              value={question.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Question"
              className="flex-1 text-lg font-medium text-slate-900 bg-slate-50 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={question.type}
              onChange={(e) => update({ type: e.target.value as QuestionType })}
              className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
            >
              <option value="text">Short answer</option>
              <option value="long_text">Paragraph</option>
              <option value="email">Email</option>
              <option value="rating">Rating</option>
              <option value="phone">Phone</option>
              <option value="date">Date</option>
              <option value="number">Number</option>
              <option value="multiple_choice">Multiple choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>

          {["multiple_choice", "checkboxes", "dropdown"].includes(
            question.type,
          ) && (
            <div className="space-y-2 ml-2">
              {(question.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border border-slate-300 ${question.type === "multiple_choice" ? "rounded-full" : "rounded-sm"}`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...(question.options || [])];
                      newOpts[i] = e.target.value;
                      update({ options: newOpts });
                    }}
                    className="flex-1 text-sm bg-transparent outline-none border-b border-transparent focus:border-blue-500 py-1"
                  />
                  <button
                    onClick={() => {
                      const newOpts = (question.options || []).filter(
                        (_, idx) => idx !== i,
                      );
                      update({ options: newOpts });
                    }}
                    className="text-slate-400 hover:text-red-500 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-4 h-4 border border-slate-300 ${question.type === "multiple_choice" ? "rounded-full" : "rounded-sm"}`}
                />
                <button
                  onClick={() =>
                    update({
                      options: [
                        ...(question.options || []),
                        `Option ${(question.options?.length || 0) + 1}`,
                      ],
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add option
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={remove}
              className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200" />
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              Required
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => update({ required: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
