import mongoose from 'mongoose';
import { ENV } from './env.js';

/**
 * Connect to MongoDB with Mongoose
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // If database connection fails during initial startup in development, log helpful message
    if (ENV.NODE_ENV === 'development') {
      console.warn('⚠️ Make sure your local MongoDB service is running (mongod) or provide a valid MONGO_URI in server/.env');
    }
    // Do not crash the process immediately in development so health check and other logic can be inspected
    return null;
  }
};
