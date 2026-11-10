/**
 * FITSync Nutrition Engine
 * 
 * Implements Mifflin-St Jeor metabolic equations and macronutrient allocation
 * as deterministic pure functions.
 * 
 * VIVA NOTE: Deterministic calculations prevent LLM arithmetic hallucinations.
 * The AI receives these calculated numbers as immutable boundary constraints.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // Little to no exercise, desk job
  light: 1.375,         // Light exercise 1-3 days/week
  moderate: 1.55,       // Moderate exercise 3-5 days/week
  active: 1.725,        // Heavy exercise 6-7 days/week
  very_active: 1.9,     // Very heavy physical labor or 2x daily training
};

export const MINIMUM_CALORIES = {
  male: 1500,
  female: 1200,
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * Male:   10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 *
 * @param {Object} params
 * @param {'male'|'female'} params.gender
 * @param {number} params.weightKg
 * @param {number} params.heightCm
 * @param {number} params.age
 * @returns {number} BMR in kcal/day
 */
export function calculateBMR({ gender, weightKg, heightCm, age }) {
  if (!gender || !weightKg || !heightCm || !age) {
    throw new Error('All fields (gender, weightKg, heightCm, age) are required to calculate BMR');
  }

  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const genderOffset = gender.toLowerCase() === 'female' ? -161 : 5;

  return Number((baseBMR + genderOffset).toFixed(2));
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 *
 * @param {number} bmr
 * @param {'sedentary'|'light'|'moderate'|'active'|'very_active'} activityLevel
 * @returns {number} TDEE in kcal/day (rounded integer)
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) {
    throw new Error(`Invalid activity level: ${activityLevel}. Must be one of ${Object.keys(ACTIVITY_MULTIPLIERS).join(', ')}`);
  }
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories based on user goal and enforce safe floor minimums
 * - lose: TDEE - 500 kcal (~0.5 kg loss per week)
 * - maintain: TDEE
 * - gain: TDEE + 300 kcal (lean surplus)
 *
 * @param {number} tdee
 * @param {'lose'|'maintain'|'gain'} goal
 * @param {'male'|'female'} gender
 * @returns {number} Safe target daily calories
 */
export function calculateTargetCalories(tdee, goal, gender = 'male') {
  let target = tdee;

  if (goal === 'lose') {
    target = tdee - 500;
  } else if (goal === 'gain') {
    target = tdee + 300;
  } else if (goal !== 'maintain') {
    throw new Error(`Invalid goal: ${goal}. Must be lose, maintain, or gain`);
  }

  // Safety floor check: never allow dangerously low calories
  const minSafe = MINIMUM_CALORIES[gender.toLowerCase()] || 1200;
  return Math.max(minSafe, target);
}

/**
 * Calculate macronutrient breakdown in grams:
 * - Protein: 1.8g/kg for lose/gain (preserve/build lean tissue), 1.6g/kg for maintain
 * - Fat: 25% of total daily calories (essential hormonal health)
 * - Carbs: Remaining caloric budget / 4
 *
 * Energy density:
 * - Protein = 4 kcal/g
 * - Fat = 9 kcal/g
 * - Carbohydrates = 4 kcal/g
 *
 * @param {number} targetCalories
 * @param {number} weightKg
 * @param {'lose'|'maintain'|'gain'} goal
 * @returns {{ protein: number, fat: number, carbs: number }} Macro targets in grams
 */
export function calculateMacros(targetCalories, weightKg, goal = 'maintain') {
  // 1. Protein target in grams
  const proteinFactor = goal === 'maintain' ? 1.6 : 1.8;
  const proteinGrams = Math.round(weightKg * proteinFactor);
  const proteinCalories = proteinGrams * 4;

  // 2. Fat target in grams (25% of total calories)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // 3. Carbohydrates from remaining caloric balance
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatGrams * 9));
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbsGrams,
  };
}

/**
 * Composite function to compute all nutritional targets in one deterministic pass
 *
 * @param {Object} profile
 * @returns {Object} Complete targets { bmr, tdee, targetCalories, protein, carbs, fat }
 */
export function computeAllTargets(profile) {
  const bmr = calculateBMR({
    gender: profile.gender,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
  });

  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.goal, profile.gender);
  const { protein, fat, carbs } = calculateMacros(targetCalories, profile.weightKg, profile.goal);

  return {
    bmr,
    tdee,
    targetCalories,
    protein,
    carbs,
    fat,
  };
}
