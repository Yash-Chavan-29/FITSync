import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [14, 'Age must be at least 14'],
      max: [100, 'Age must be under 100'],
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Gender is required'],
    },
    heightCm: {
      type: Number,
      required: [true, 'Height in cm is required'],
      min: [100, 'Height must be at least 100 cm'],
      max: [250, 'Height cannot exceed 250 cm'],
    },
    weightKg: {
      type: Number,
      required: [true, 'Weight in kg is required'],
      min: [30, 'Weight must be at least 30 kg'],
      max: [300, 'Weight cannot exceed 300 kg'],
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      required: [true, 'Activity level is required'],
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain'],
      required: [true, 'Fitness goal is required'],
    },
    dietType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'eggetarian'],
      required: [true, 'Diet type is required'],
    },
    allergies: {
      type: [String],
      default: [],
    },
    cuisinePreference: {
      type: String,
      default: 'Indian',
      trim: true,
    },
    equipment: {
      type: [String],
      enum: ['none', 'dumbbells', 'barbell', 'resistance_bands', 'full_gym'],
      default: ['none'],
    },
    workoutDaysPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      default: 4,
    },
    sessionMinutes: {
      type: Number,
      min: 15,
      max: 120,
      default: 45,
    },
    computed: {
      bmr: { type: Number, required: true },
      tdee: { type: Number, required: true },
      targetCalories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
    isOnboarded: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
