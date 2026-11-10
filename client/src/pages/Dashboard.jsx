import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Apple,
  Activity,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Settings,
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-sm text-slate-400 mb-6">
            We need your biological baseline and fitness targets to compute your metabolic numbers.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20"
          >
            Start Setup Wizard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { computed } = profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="h-3.5 w-3.5" />
            FITSync Dashboard
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your physiological engine is tuned for{' '}
            <span className="text-emerald-400 font-semibold uppercase">
              {profile.goal === 'lose' && 'Fat Shred (-500 kcal)'}
              {profile.goal === 'maintain' && 'Weight Maintenance'}
              {profile.goal === 'gain' && 'Muscle Hypertrophy (+300 kcal)'}
            </span>
          </p>
        </div>

        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold self-start md:self-auto transition-colors"
        >
          <Settings className="h-4 w-4" />
          Adjust Baseline Metrics
        </Link>
      </div>

      {/* Target Metrics Grid (Viva Highlight: Mifflin-St Jeor Engine) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calorie Target Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-emerald-500/30 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              Daily Caloric Target
            </span>
            <span className="bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Active</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {computed.targetCalories}{' '}
            <span className="text-xs font-normal text-slate-400">kcal/day</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>BMR: {computed.bmr}</span>
            <span>TDEE: {computed.tdee}</span>
          </div>
        </div>

        {/* Protein Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-teal-400 font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <Apple className="h-4 w-4" />
              Daily Protein
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {profile.goal === 'maintain' ? '1.6g/kg' : '1.8g/kg'}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {computed.protein} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            {computed.protein * 4} kcal / day ({Math.round(((computed.protein * 4) / computed.targetCalories) * 100)}% of target)
          </div>
        </div>

        {/* Carbs Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Daily Carbohydrates
            </span>
            <span className="text-slate-400 font-mono text-[10px]">Energy</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {computed.carbs} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            {computed.carbs * 4} kcal / day ({Math.round(((computed.carbs * 4) / computed.targetCalories) * 100)}% of target)
          </div>
        </div>

        {/* Fat Target */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-rose-400 font-bold uppercase mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              Healthy Fats
            </span>
            <span className="text-slate-400 font-mono text-[10px]">25% total</span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {computed.fat} <span className="text-xs font-normal text-slate-400">g</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            {computed.fat * 9} kcal / day (Hormonal health)
          </div>
        </div>
      </div>

      {/* Profile Constraints & AI Generator Teaser Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GenAI Action Banner */}
        <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/20 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Phase 3: AI Plan Generator Ready
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to generate your custom 7-Day Plan?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Our Generative AI engine will pair your mathematical macro target ({computed.targetCalories} kcal) with your {profile.dietType} dietary constraints, allergy blacklist, and {profile.workoutDaysPerWeek}x weekly workout routine.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => alert('Phase 1 & 2 are complete! Phase 3 (AI Plan Generator with Gemini API) is next.')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              Generate 7-Day Plan
            </button>
            <span className="text-xs text-slate-400">Takes ~15-20 seconds to compile</span>
          </div>
        </div>

        {/* Right 1 Col: User Constraints Overview */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active User Constraints
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Diet Type:</span>
              <span className="font-semibold text-white capitalize">{profile.dietType}</span>
            </div>

            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Cuisine:</span>
              <span className="font-semibold text-white">{profile.cuisinePreference}</span>
            </div>

            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Equipment:</span>
              <span className="font-semibold text-white capitalize">
                {profile.equipment.join(', ')}
              </span>
            </div>

            <div className="flex justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Workout Schedule:</span>
              <span className="font-semibold text-white">
                {profile.workoutDaysPerWeek} days / {profile.sessionMinutes} mins
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-400">Allergies:</span>
              <span className="font-semibold text-rose-400">
                {profile.allergies.length > 0 ? profile.allergies.join(', ') : 'None registered'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
        <p>
          <span className="font-semibold text-slate-300">Medical Notice:</span> FITSync calculations are based on the standard Mifflin-St Jeor metabolic model for healthy adults and are intended strictly for educational and general wellness tracking.
        </p>
      </div>
    </div>
  );
}
