import { z } from 'zod';

export const profileSchema = z.object({
  age: z
    .number({ required_error: 'Age is required' })
    .min(14, 'Age must be at least 14')
    .max(100, 'Age must be under 100'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'Gender must be male or female' }),
  }),
  heightCm: z
    .number({ required_error: 'Height in cm is required' })
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be under 250 cm'),
  weightKg: z
    .number({ required_error: 'Weight in kg is required' })
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be under 300 kg'),
  activityLevel: z.enum(
    ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    { errorMap: () => ({ message: 'Invalid activity level selection' }) }
  ),
  goal: z.enum(['lose', 'maintain', 'gain'], {
    errorMap: () => ({ message: 'Goal must be lose, maintain, or gain' }),
  }),
  dietType: z.enum(['veg', 'non-veg', 'vegan', 'eggetarian'], {
    errorMap: () => ({ message: 'Invalid diet type' }),
  }),
  allergies: z.array(z.string().trim().toLowerCase()).default([]),
  cuisinePreference: z.string().trim().default('Indian'),
  equipment: z
    .array(z.enum(['none', 'dumbbells', 'barbell', 'resistance_bands', 'full_gym']))
    .default(['none']),
  workoutDaysPerWeek: z
    .number()
    .min(1, 'Minimum 1 workout day per week')
    .max(7, 'Maximum 7 workout days per week')
    .default(4),
  sessionMinutes: z
    .number()
    .min(15, 'Minimum workout session is 15 minutes')
    .max(120, 'Maximum workout session is 120 minutes')
    .default(45),
});

export const updateProfileSchema = profileSchema.partial();
