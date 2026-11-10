import Profile from '../models/Profile.js';
import { profileSchema, updateProfileSchema } from '../validators/profile.validator.js';
import { computeAllTargets } from '../services/nutrition.service.js';

/**
 * @desc    Save or create user onboarding profile and compute targets
 * @route   POST /api/profile
 * @access  Private
 */
export const saveProfile = async (req, res, next) => {
  try {
    const validatedData = profileSchema.parse(req.body);

    // Compute deterministic metabolic targets (BMR, TDEE, Calories, Macros)
    const computed = computeAllTargets(validatedData);

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...validatedData,
        userId: req.user._id,
        computed,
        isOnboarded: true,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile and metabolic targets calculated and saved successfully.',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's profile and nutritional targets
 * @route   GET /api/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No profile found. Please complete onboarding.',
        data: { profile: null },
      });
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile and recalculate targets
 * @route   PUT /api/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);

    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please complete onboarding first.',
      });
    }

    // Merge existing profile data with updates to recalculate targets
    const mergedData = {
      ...existingProfile.toObject(),
      ...validatedData,
    };

    const computed = computeAllTargets(mergedData);

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      {
        ...validatedData,
        computed,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile and metabolic targets updated successfully.',
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate targets preview on the fly without saving to DB
 * @route   POST /api/profile/calculate-preview
 * @access  Public / Private
 */
export const calculatePreview = (req, res, next) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;
    if (!age || !gender || !heightCm || !weightKg || !activityLevel || !goal) {
      return res.status(400).json({
        success: false,
        message: 'All metrics are required to calculate preview targets.',
      });
    }

    const computed = computeAllTargets({
      age: Number(age),
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      goal,
    });

    res.status(200).json({
      success: true,
      data: { computed },
    });
  } catch (error) {
    next(error);
  }
};
