import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Sparkles, Layout, BarChart, QrCode, Brain, Wand2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { user, signInWithGoogle, signInAnonymously } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setAuthError(null);
    if (user) {
      navigate('/dashboard');
    } else {
      try {
        await signInWithGoogle();
        navigate('/dashboard');
      } catch (error) {
        console.error("Login failed", error);
        setAuthError("Google Sign-In requires third-party cookies or an authorized domain. Please use 'Continue as Guest' below instead.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FormForge</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How it Works</a>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                onClick={handleGetStarted}
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                Log in
              </button>
            )}
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {authError && (
        <div className="bg-red-50 text-red-600 p-4 text-center text-sm font-medium border-b border-red-100">
          {authError}
        </div>
      )}
      <section className="pt-24 pb-16 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Form Builder</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
          Describe it. <br/> We build the form.
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Create beautiful, intelligent forms in seconds using AI. Just tell FormForge what you need, and we'll generate a complete, ready-to-publish form instantly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <button 
             onClick={handleGetStarted}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Sign in with Google <ArrowRight className="w-5 h-5" />
          </button>
          <button 
             onClick={async () => { 
               try {
                 await signInAnonymously();
                 navigate('/dashboard');
               } catch(e) { console.error(e); } 
             }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm hover:-translate-y-0.5"
          >
            Continue as Guest
          </button>
        </div>

        {/* Interactive Example Mockup */}
        <div className="mt-16 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left max-w-3xl mx-auto">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="p-6 md:p-10">
            <div className="flex gap-4 items-start mb-8">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-bold text-sm">You</span>
              </div>
              <div className="bg-blue-50 text-slate-700 p-4 rounded-2xl rounded-tl-none font-medium">
                "Create a customer feedback form for our new coffee shop"
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl rounded-tl-none shadow-sm flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Coffee Shop Feedback</h3>
                <p className="text-slate-500 text-sm mb-6">We'd love to hear about your experience!</p>
                <div className="space-y-4">
                  <div className="h-10 bg-slate-50 rounded border border-slate-200 w-full" />
                  <div className="h-24 bg-slate-50 rounded border border-slate-200 w-full" />
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white border-t border-slate-200 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Powerful tools designed for speed, beauty, and intelligent insights.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Wand2, title: "AI Form Generation", desc: "Type what you need, and watch our AI instantly build a perfectly structured form." },
              { icon: Layout, title: "Beautiful Design", desc: "Clean, responsive forms that look incredible on every device, right out of the box." },
              { icon: Brain, title: "Smart Logic", desc: "Easily set up conditional branching to show relevant questions based on previous answers." },
              { icon: BarChart, title: "Powerful Analytics", desc: "View real-time charts, completion rates, and dive deep into your collected data." },
              { icon: QrCode, title: "QR Sharing", desc: "Generate instant QR codes to collect responses at events or physical locations." },
              { icon: ShieldCheck, title: "AI Insights", desc: "Let AI analyze your responses to extract sentiment, summaries, and key recommendations." },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-900 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to collect better data?</h2>
          <p className="text-slate-300 mb-10 text-lg">Join thousands of users building smarter forms with AI.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
            >
              Sign in with Google
            </button>
            <button 
              onClick={async () => { 
                try {
                  await signInAnonymously();
                  navigate('/dashboard');
                } catch(e) { console.error(e); } 
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-8 py-4 rounded-full text-lg font-semibold transition-colors shadow-lg"
            >
              Continue as Guest
            </button>
          </div>

        </div>
      </section>
    </div>
  );
}
