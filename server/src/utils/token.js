import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate a JWT for a user
 * @param {string} userId
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Send HTTP-only cookie with JWT token
 * @param {Response} res Express response object
 * @param {string} token JWT token
 */
export const setTokenCookie = (res, token) => {
  const isProduction = ENV.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: isProduction, // Send over HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear the authentication cookie
 * @param {Response} res Express response object
 */
export const clearTokenCookie = (res) => {
  const isProduction = ENV.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
};
