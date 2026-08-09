import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Form } from "../types";
import {
  Plus,
  LayoutTemplate,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  MoreVertical,
  Search,
  Copy,
  Trash2,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchForms = async () => {
      try {
        const q = query(
          collection(db, "forms"),
          where("ownerId", "==", user.uid),
          orderBy("updatedAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const formsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Form,
        );
        setForms(formsData);
      } catch (error) {
        console.error("Error fetching forms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [user]);

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const generateForm = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Failed to generate form");

      const generatedData = await response.json();

      const newForm = {
        ownerId: user?.uid,
        title: generatedData.title || "Untitled Form",
        description: generatedData.description || "",
        theme: generatedData.theme || "light",
        status: "draft",
        questions: generatedData.questions || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, "forms"), newForm);
      navigate(`/builder/${docRef.id}`);
    } catch (error) {
      console.error("Error generating form", error);
      alert("Failed to generate form. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsModalOpen(false);
      setPrompt("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="text-xl font-bold text-slate-900">FormForge</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={LayoutTemplate} label="Dashboard" active />
          <NavItem icon={FileText} label="My Forms" />
          <NavItem icon={BarChart3} label="Templates" />
          <NavItem icon={Settings} label="Settings" />
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
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

        {/* Stats */}
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

        {/* Recent Forms */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Recent Forms</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search forms..."
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
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
              You haven't created any forms. Click the button below to generate
              your first form with AI.
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
                {forms.map((form) => (
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          form.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
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
                          onClick={() => navigate(`/builder/${form.id}`)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1"
                        >
                          Edit
                        </button>
                        {form.status === "published" && (
                          <button
                            onClick={() => navigate(`/analytics/${form.id}`)}
                            className="text-slate-600 hover:text-slate-900 px-2 py-1 hidden sm:block"
                          >
                            Results
                          </button>
                        )}
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {/* Create Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Create a new form with AI
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Describe the form you want to create, and our AI will generate the
              questions for you.
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A feedback form for my new coffee shop with rating out of 5..."
              className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none mb-6 text-sm"
              disabled={isGenerating}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={generateForm}
                disabled={!prompt || isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Form"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon
        className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`}
      />
      {label}
    </a>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
