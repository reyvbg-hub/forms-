import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Form, FormResponse, Analysis } from '../types';
import { ArrowLeft, Brain, Download, PieChart, Users, Clock, Loader2, RefreshCw } from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function Analytics() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    const fetchData = async () => {
      try {
        const formRef = doc(db, 'forms', id);
        const formSnap = await getDoc(formRef);
        
        if (formSnap.exists() && formSnap.data().ownerId === user.uid) {
          setForm({ id: formSnap.id, ...formSnap.data() } as Form);
        } else {
          navigate('/dashboard');
          return;
        }

        const q = query(
          collection(db, 'responses'),
          where('formId', '==', id),
          where('ownerId', '==', user.uid),
          orderBy('submittedAt', 'desc')
        );
        const resSnap = await getDocs(q);
        const resData = resSnap.docs.map(d => ({ id: d.id, ...d.data() } as FormResponse));
        setResponses(resData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const handleAnalyze = async () => {
    if (!form || responses.length === 0) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          form, 
          responses: responses.map(r => r.answers) 
        })
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze responses.');
    } finally {
      setAnalyzing(false);
    }
  };

  const exportCSV = () => {
    if (!form || responses.length === 0) return;
    
    const headers = form.questions.map(q => q.title);
    const rows = responses.map(r => {
      return form.questions.map(q => {
        const answer = r.answers.find(a => a.questionId === q.id);
        const val = answer ? answer.value : '';
        return `"${Array.isArray(val) ? val.join(', ') : val}"`;
      });
    });

    const csvContent = [
      ["Date", ...headers].join(','),
      ...rows.map((row, i) => [new Date(responses[i].submittedAt).toISOString(), ...row].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${form.title}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{form.title}</h1>
            <p className="text-xs text-slate-500">Analytics & Responses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportCSV}
            disabled={responses.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Responses</p>
              <p className="text-3xl font-bold text-slate-900">{responses.length}</p>
            </div>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Waiting for responses</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Share your form to start collecting data. Insights will appear here automatically.</p>
            <button 
              onClick={() => navigate(`/builder/${form.id}`)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Back to Editor
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg p-1 overflow-hidden">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-400" />
                      AI Response Analysis
                    </h2>
                    <p className="text-indigo-200 text-sm mt-1">Get instant summaries and actionable insights from your data.</p>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-white hover:bg-indigo-50 text-indigo-900 px-5 py-2.5 rounded-full text-sm font-semibold shadow-md transition-colors disabled:opacity-75 flex items-center gap-2"
                  >
                    {analyzing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><RefreshCw className="w-4 h-4" /> Generate Insights</>
                    )}
                  </button>
                </div>

                {analysis && (
                  <div className="grid md:grid-cols-2 gap-6 mt-8 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                        <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Summary</h3>
                        <p className="text-white leading-relaxed">{analysis.summary}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                        <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-3">Key Insights</h3>
                        <ul className="space-y-2">
                          {analysis.keyInsights.map((insight, i) => (
                            <li key={i} className="flex gap-2 text-white">
                              <span className="text-indigo-400 mt-1">•</span> {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                        <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Overall Sentiment</h3>
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize bg-white/20 text-white">
                          {analysis.sentiment}
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                        <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex gap-2 text-white">
                              <span className="text-indigo-400 mt-1">→</span> {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Responses Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Recent Responses</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      {form.questions.slice(0, 3).map(q => (
                        <th key={q.id} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[200px]">
                          {q.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {responses.slice(0, 20).map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(r.submittedAt).toLocaleDateString()} {new Date(r.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        {form.questions.slice(0, 3).map(q => {
                          const ans = r.answers.find(a => a.questionId === q.id);
                          const val = ans ? ans.value : '-';
                          return (
                            <td key={q.id} className="px-6 py-4 text-sm text-slate-900 truncate max-w-[200px]">
                              {Array.isArray(val) ? val.join(', ') : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
