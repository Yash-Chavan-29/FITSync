import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function ProtectedRoute({ children, requireOnboarding = false }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse mb-4">
          <Activity className="h-6 w-6 text-emerald-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Loading your fitness dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and preserve the intended route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires onboarding completed and user hasn't onboarded yet, redirect to onboarding
  if (requireOnboarding && !profile?.isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
