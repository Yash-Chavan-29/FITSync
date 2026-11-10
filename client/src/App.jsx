import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import {
  Activity,
  Sparkles,
  Dumbbell,
  Apple,
  ArrowRight,
} from 'lucide-react';

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-6 md:p-12">
      {/* Hero Section */}
      <main className="max-w-4xl mx-auto w-full my-auto text-center py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          BCA Final Year Project &bull; Generative AI Fitness & Nutrition
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
          Tailored Fitness Driven by{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Mathematical Precision & AI
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          FITSync merges Mifflin-St Jeor metabolic calculations with Generative AI
          to engineer adaptive 7-day meal and workout plans tailored to your exact dietary constraints and equipment.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
            >
              Open Your Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
              >
                Start Free Onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold text-sm transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* 3 Pillars Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Apple className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Deterministic Nutrition</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mifflin-St Jeor pure functions calculate your BMR, TDEE, and macro splits. No arithmetic hallucinations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
              <Dumbbell className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Generative AI Plans</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gemini creates 7-day meal and exercise routines restricted to your available equipment and allergies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Live AI Assistant</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              &quot;I don&apos;t have paneer today&quot; &mdash; the AI calculates a structured replacement that preserves your daily macros.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center py-4 border-t border-slate-900 text-xs text-slate-500">
        FITSync BCA Final Year Project &bull; Generative AI & Deterministic Health Engine
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}
