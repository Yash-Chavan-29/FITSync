import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts',
  'Dairy/Lactose',
  'Gluten/Wheat',
  'Eggs',
  'Soy',
  'Tree Nuts',
  'Fish',
  'Shellfish',
];

export default function Onboarding() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State initialized with defaults or existing profile data
  const [formData, setFormData] = useState({
    age: profile?.age || 25,
    gender: profile?.gender || 'male',
    heightCm: profile?.heightCm || 175,
    weightKg: profile?.weightKg || 70,
    activityLevel: profile?.activityLevel || 'moderate',
    goal: profile?.goal || 'lose',
    dietType: profile?.dietType || 'veg',
    allergies: profile?.allergies || [],
    cuisinePreference: profile?.cuisinePreference || 'Indian',
    equipment: profile?.equipment || ['dumbbells'],
    workoutDaysPerWeek: profile?.workoutDaysPerWeek || 4,
    sessionMinutes: profile?.sessionMinutes || 45,
  });

  const [previewTargets, setPreviewTargets] = useState(null);

  // Compute targets whenever metrics change
  useEffect(() => {
    try {
      // Calculate locally or fetch preview from backend
      api.post('/profile/calculate-preview', {
        age: formData.age,
        gender: formData.gender,
        heightCm: formData.heightCm,
        weightKg: formData.weightKg,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
      }).then((res) => {
        if (res.data.success) {
          setPreviewTargets(res.data.data.computed);
        }
      }).catch(() => {
        // Fallback calculations in client if network hiccup
      });
    } catch {
      // silent
    }
  }, [formData.age, formData.gender, formData.heightCm, formData.weightKg, formData.activityLevel, formData.goal]);

  const handleAllergyToggle = (allergy) => {
    const formatted = allergy.toLowerCase();
    setFormData((prev) => {
      const exists = prev.allergies.includes(formatted);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== formatted)
          : [...prev.allergies, formatted],
      };
    });
  };

  const handleEquipmentToggle = (item) => {
    setFormData((prev) => {
      const exists = prev.equipment.includes(item);
      let updated;
      if (item === 'none') {
        updated = ['none'];
      } else {
        const withoutNone = prev.equipment.filter((e) => e !== 'none');
        updated = exists
          ? withoutNone.filter((e) => e !== item)
          : [...withoutNone, item];
        if (updated.length === 0) updated = ['none'];
      }
      return { ...prev, equipment: updated };
    });
  };

  const handleNext = () => {
    setError('');
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        age: Number(formData.age),
        gender: formData.gender,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietType: formData.dietType,
        allergies: formData.allergies,
        cuisinePreference: formData.cuisinePreference,
        equipment: formData.equipment,
        workoutDaysPerWeek: Number(formData.workoutDaysPerWeek),
        sessionMinutes: Number(formData.sessionMinutes),
      };

      const res = await api.post('/profile', payload);
      if (res.data.success) {
        await refreshProfile();
        navigate('/dashboard');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save profile. Please check your inputs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>STEP {step} OF 5</span>
          <span className="text-emerald-400 font-medium">
            {step === 1 && 'Body Metrics & Biological Baseline'}
            {step === 2 && 'Fitness Objective & Activity'}
            {step === 3 && 'Nutrition Preferences & Allergies'}
            {step === 4 && 'Workout Setup & Equipment'}
            {step === 5 && 'Your Verified Metabolic Blueprint'}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-sm text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Container Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* STEP 1: Body Metrics */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Let&apos;s start with the biological basics
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Your BMR will be calculated deterministically using the scientifically validated Mifflin-St Jeor formula.
              </p>
            </div>

            {/* Gender Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Biological Sex (Used for BMR Equation)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`p-4 rounded-xl border text-center font-semibold text-sm transition-all ${
                    formData.gender === 'male'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`p-4 rounded-xl border text-center font-semibold text-sm transition-all ${
                    formData.gender === 'female'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  min="14"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.5"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Goal & Activity */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Your Fitness Goal & Daily Activity Level
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                This dictates your caloric deficit or surplus and metabolic multiplier.
              </p>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Target Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'lose', title: 'Fat Loss', desc: '-500 kcal deficit (lean shred)' },
                  { id: 'maintain', title: 'Maintenance', desc: 'Exact TDEE energy equilibrium' },
                  { id: 'gain', title: 'Muscle Gain', desc: '+300 kcal controlled surplus' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.goal === g.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{g.title}</div>
                    <div className="text-xs text-slate-400 mt-1">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Daily Physical Activity Multiplier
              </label>
              <div className="space-y-2.5">
                {[
                  { id: 'sedentary', name: 'Sedentary', mult: '1.2x', desc: 'Desk job, little to no regular exercise' },
                  { id: 'light', name: 'Lightly Active', mult: '1.375x', desc: 'Light workouts 1-3 days per week' },
                  { id: 'moderate', name: 'Moderately Active', mult: '1.55x', desc: 'Moderate exercise 3-5 days per week' },
                  { id: 'active', name: 'Very Active', mult: '1.725x', desc: 'Intense training 6-7 days per week' },
                  { id: 'very_active', name: 'Extremely Active', mult: '1.9x', desc: 'Athletic training or intense physical labor' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, activityLevel: act.id })}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      formData.activityLevel === act.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm text-white">{act.name}</span>
                      <span className="text-xs text-slate-400 ml-2">— {act.desc}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {act.mult}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Diet & Allergies */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Dietary Preference & Food Allergies
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Allergies are enforced as hard non-negotiable boundaries both in prompt engineering and code checks.
              </p>
            </div>

            {/* Diet Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Diet Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'veg', label: 'Vegetarian' },
                  { id: 'non-veg', label: 'Non-Vegetarian' },
                  { id: 'vegan', label: 'Vegan' },
                  { id: 'eggetarian', label: 'Eggetarian' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, dietType: d.id })}
                    className={`p-3 rounded-xl border text-center font-medium text-xs sm:text-sm transition-all ${
                      formData.dietType === d.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Allergies & Intolerances (Hard Constraints)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isChecked = formData.allergies.includes(allergy.toLowerCase());
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleAllergyToggle(allergy)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{allergy}</span>
                      {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cuisine Preference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Preferred Regional Cuisine
              </label>
              <input
                type="text"
                value={formData.cuisinePreference}
                onChange={(e) => setFormData({ ...formData, cuisinePreference: e.target.value })}
                placeholder="e.g. Indian (Roti, Dal, Paneer), Mediterranean, etc."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Workout Schedule & Equipment */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Workout Equipment & Routine Frequency
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                The generative planner will restrict exercise selections strictly to your selected equipment.
              </p>
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Available Equipment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'none', label: 'Bodyweight Only (No Equipment)' },
                  { id: 'dumbbells', label: 'Dumbbells' },
                  { id: 'resistance_bands', label: 'Resistance Bands' },
                  { id: 'barbell', label: 'Barbell & Plates' },
                  { id: 'full_gym', label: 'Full Commercial Gym' },
                ].map((eq) => {
                  const isChecked = formData.equipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => handleEquipmentToggle(eq.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-semibold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{eq.label}</span>
                      {isChecked && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Workout Days */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Training Frequency (Days / Week)
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData({ ...formData, workoutDaysPerWeek: days })}
                      className={`flex-1 py-2.5 rounded-xl border text-center font-semibold text-sm transition-all ${
                        formData.workoutDaysPerWeek === days
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Session Duration
                </label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setFormData({ ...formData, sessionMinutes: mins })}
                      className={`flex-1 py-2.5 rounded-xl border text-center font-semibold text-sm transition-all ${
                        formData.sessionMinutes === mins
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Calculated Metabolic Blueprint */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Mifflin-St Jeor Deterministic Engine
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Your Scientific Metabolic Blueprint
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Computed purely via algorithmic mathematics. These numbers will strictly govern AI meal and workout planning.
                </p>
              </div>
            </div>

            {previewTargets ? (
              <div className="space-y-6">
                {/* Big Highlights: BMR, TDEE, Target Calories */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Basal Metabolic Rate (BMR)</div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                      {previewTargets.bmr} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Resting burn via Mifflin-St Jeor formula</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Maintenance Burn (TDEE)</div>
                    <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                      {previewTargets.tdee} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Daily expenditure with activity multiplier</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left shadow-lg shadow-emerald-500/5">
                    <div className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      Target Daily Calories
                    </div>
                    <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
                      {previewTargets.targetCalories} <span className="text-xs font-normal text-emerald-300">kcal/day</span>
                    </div>
                    <p className="text-[11px] text-emerald-400/80 mt-1">
                      {formData.goal === 'lose' && '-500 kcal deficit (safe fat loss)'}
                      {formData.goal === 'maintain' && 'Caloric balance (weight maintenance)'}
                      {formData.goal === 'gain' && '+300 kcal surplus (lean hypertrophy)'}
                    </p>
                  </div>
                </div>

                {/* Macronutrient Split Cards */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
                    Calculated Daily Macronutrient Split
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Protein */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-teal-400 uppercase">Protein</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {formData.goal === 'maintain' ? '1.6g/kg' : '1.8g/kg'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">{previewTargets.protein}g</div>
                      <div className="text-[11px] text-slate-500 mt-1">{previewTargets.protein * 4} kcal (4 kcal/g)</div>
                    </div>

                    {/* Carbohydrates */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-amber-400 uppercase">Carbohydrates</span>
                        <span className="text-xs text-slate-400 font-mono">Remaining</span>
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">{previewTargets.carbs}g</div>
                      <div className="text-[11px] text-slate-500 mt-1">{previewTargets.carbs * 4} kcal (4 kcal/g)</div>
                    </div>

                    {/* Fats */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-rose-400 uppercase">Healthy Fats</span>
                        <span className="text-xs text-slate-400 font-mono">25% total</span>
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">{previewTargets.fat}g</div>
                      <div className="text-[11px] text-slate-500 mt-1">{previewTargets.fat * 9} kcal (9 kcal/g)</div>
                    </div>
                  </div>
                </div>

                {/* Safety & Medical Disclaimer */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold text-slate-300">Safety Guarantee:</span> Minimum calorie floor ({formData.gender === 'female' ? '1,200 kcal' : '1,500 kcal'}) strictly enforced to safeguard against metabolic crash. FITSync provides personalized fitness guidance and is not a substitute for clinical medical advice.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                Calculating your metabolic metrics...
              </div>
            )}
          </div>
        )}

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-800/80 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 text-sm font-extrabold shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Your Targets...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Setup & Go to Dashboard
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
