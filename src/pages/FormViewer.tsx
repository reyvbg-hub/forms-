import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { Form, Question } from "../types";

export default function FormViewer() {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchForm = async () => {
      try {
        const docRef = doc(db, "forms", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const formData = { id: docSnap.id, ...docSnap.data() } as Form;
          if (formData.status !== "published") {
            alert("This form is not publicly available.");
            return;
          }
          setForm(formData);
        }
      } catch (error) {
        console.error("Error loading form", error);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;

    // Basic validation
    const missingRequired = form.questions.filter((q) => {
      if (!q.required) return false;
      const val = answers[q.id];
      if (val === undefined || val === null || val === "") return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => ({
          questionId,
          value,
        }),
      );

      await addDoc(collection(db, "responses"), {
        formId: id,
        ownerId: form.ownerId,
        submittedAt: Date.now(),
        answers: formattedAnswers,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form", error);
      setError("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Loading...
      </div>
    );
  if (!form)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        Form not found or unavailable.
      </div>
    );

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center border-t-8 border-t-blue-600">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {form.title}
          </h2>
          <p className="text-slate-600 mb-8 text-lg">
            Your response has been recorded.
          </p>
          <button
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 border-t-8 border-t-blue-600">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-slate-600">{form.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <label className="block mb-4">
                <span className="text-base font-semibold text-slate-900">
                  {q.title}{" "}
                  {q.required && <span className="text-red-500">*</span>}
                </span>
              </label>

              {[
                "text",
                "email",
                "phone",
                "date",
                "number",
                "url",
                "password",
              ].includes(q.type) && (
                <input
                  type={
                    ["email", "date", "number", "url", "password"].includes(
                      q.type,
                    )
                      ? q.type
                      : q.type === "phone"
                        ? "tel"
                        : "text"
                  }
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                  className="w-full border-b border-slate-300 focus:border-blue-600 outline-none py-2 bg-transparent text-slate-900"
                  placeholder="Your answer"
                />
              )}

              {q.type === "long_text" && (
                <textarea
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                  className="w-full border-b border-slate-300 focus:border-blue-600 outline-none py-2 bg-transparent text-slate-900 resize-y"
                  placeholder="Your answer"
                  rows={3}
                />
              )}

              {q.type === "multiple_choice" && (
                <div className="space-y-3">
                  {(q.options || []).map((opt, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        required={q.required && !answers[q.id]}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "checkboxes" && (
                <div className="space-y-3">
                  {(q.options || []).map((opt, i) => {
                    const checked = (answers[q.id] || []).includes(opt);
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = answers[q.id] || [];
                            const newVals = e.target.checked
                              ? [...current, opt]
                              : current.filter((v: string) => v !== opt);
                            setAnswers({ ...answers, [q.id]: newVals });
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-slate-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === "dropdown" && (
                <select
                  required={q.required}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>
                    Choose
                  </option>
                  {(q.options || []).map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {q.type === "rating" && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: num })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border font-medium transition-colors ${answers[q.id] === num ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-full text-base font-semibold shadow-sm transition-colors"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Powered by FormForge</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
