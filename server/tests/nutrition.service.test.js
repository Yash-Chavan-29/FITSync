import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  computeAllTargets,
} from '../src/services/nutrition.service.js';

describe('FITSync Nutrition Engine Tests', () => {
  describe('calculateBMR (Mifflin-St Jeor)', () => {
    test('accurately calculates BMR for standard male test case (25y, 175cm, 70kg)', () => {
      // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
      const bmr = calculateBMR({
        gender: 'male',
        weightKg: 70,
        heightCm: 175,
        age: 25,
      });
      expect(bmr).toBe(1673.75);
    });

    test('accurately calculates BMR for female test case (30y, 160cm, 55kg)', () => {
      // 10*55 + 6.25*160 - 5*30 - 161 = 550 + 1000 - 150 - 161 = 1239
      const bmr = calculateBMR({
        gender: 'female',
        weightKg: 55,
        heightCm: 160,
        age: 30,
      });
      expect(bmr).toBe(1239);
    });

    test('throws error if required parameter is missing', () => {
      expect(() => calculateBMR({ gender: 'male', weightKg: 70 })).toThrow();
    });
  });

  describe('calculateTDEE', () => {
    test('calculates correct TDEE with moderate activity multiplier (1.55)', () => {
      // 1673.75 * 1.55 = 2594.3125 => rounded to 2594
      const tdee = calculateTDEE(1673.75, 'moderate');
      expect(tdee).toBe(2594);
    });

    test('calculates correct TDEE with sedentary activity multiplier (1.2)', () => {
      const tdee = calculateTDEE(1673.75, 'sedentary');
      expect(tdee).toBe(Math.round(1673.75 * 1.2));
    });

    test('throws error for invalid activity level', () => {
      expect(() => calculateTDEE(1673.75, 'couch_potato')).toThrow();
    });
  });

  describe('calculateTargetCalories and Safety Floors', () => {
    test('applies 500 kcal deficit for weight loss', () => {
      const target = calculateTargetCalories(2500, 'lose', 'male');
      expect(target).toBe(2000);
    });

    test('applies 300 kcal surplus for weight gain', () => {
      const target = calculateTargetCalories(2500, 'gain', 'male');
      expect(target).toBe(2800);
    });

    test('returns exact TDEE for maintain goal', () => {
      const target = calculateTargetCalories(2500, 'maintain', 'male');
      expect(target).toBe(2500);
    });

    test('enforces safety minimum of 1500 kcal for males', () => {
      // TDEE of 1700 - 500 = 1200, which is below 1500 floor
      const target = calculateTargetCalories(1700, 'lose', 'male');
      expect(target).toBe(1500);
    });

    test('enforces safety minimum of 1200 kcal for females', () => {
      // TDEE of 1400 - 500 = 900, which is below 1200 floor
      const target = calculateTargetCalories(1400, 'lose', 'female');
      expect(target).toBe(1200);
    });
  });

  describe('calculateMacros', () => {
    test('calculates macros correctly for 2000 kcal and 70kg weight with lose goal', () => {
      // Protein: 70 * 1.8 = 126g => 504 kcal
      // Fat: 2000 * 0.25 / 9 = 500 / 9 = 55.55 => 56g => 504 kcal
      // Carbs: (2000 - (504 + 504)) / 4 = 992 / 4 = 248g
      const macros = calculateMacros(2000, 70, 'lose');
      expect(macros.protein).toBe(126);
      expect(macros.fat).toBe(56);
      expect(macros.carbs).toBe(248);
    });

    test('uses 1.6 g/kg protein for maintain goal', () => {
      const macros = calculateMacros(2500, 70, 'maintain');
      expect(macros.protein).toBe(112); // 70 * 1.6 = 112
    });
  });

  describe('computeAllTargets (Composite)', () => {
    test('calculates full target suite for test profile', () => {
      const profile = {
        gender: 'male',
        weightKg: 70,
        heightCm: 175,
        age: 25,
        activityLevel: 'moderate',
        goal: 'maintain',
      };

      const result = computeAllTargets(profile);
      expect(result.bmr).toBe(1673.75);
      expect(result.tdee).toBe(2594);
      expect(result.targetCalories).toBe(2594);
      expect(result.protein).toBe(112);
      expect(result.fat).toBe(72);
      expect(result.carbs).toBe(375);
    });
  });
});
