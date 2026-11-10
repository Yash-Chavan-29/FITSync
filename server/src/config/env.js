import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/fitsync',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key_change_in_prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Validate critical variables in production
if (ENV.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev_secret'))) {
  console.warn('⚠️ WARNING: Using an insecure JWT_SECRET in production!');
}
