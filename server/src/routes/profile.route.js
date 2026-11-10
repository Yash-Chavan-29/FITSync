import express from 'express';
import {
  saveProfile,
  getProfile,
  updateProfile,
  calculatePreview,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public/semi-public preview calculation endpoint
router.post('/calculate-preview', calculatePreview);

// Protected routes
router.post('/', authenticate, saveProfile);
router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

export default router;
