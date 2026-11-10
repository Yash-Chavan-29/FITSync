import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import User from '../models/User.js';

/**
 * Authentication Middleware
 * Checks for JWT in httpOnly cookie or Authorization Bearer header,
 * verifies the token, and attaches the user document to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback: Check Authorization header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Fetch user (without password hash)
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or session has expired.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: error.name === 'TokenExpiredError' 
          ? 'Session expired. Please log in again.' 
          : 'Invalid token.',
      });
    }
    next(error);
  }
};
