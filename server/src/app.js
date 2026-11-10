import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoute from './routes/health.route.js';
import authRoute from './routes/auth.route.js';
import profileRoute from './routes/profile.route.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration (allow client requests with cookies)
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base API Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);

// 404 Not Found fallback handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on route ${req.originalUrl}`,
  });
});

// Central Error Handler Middleware
app.use(errorHandler);

export default app;
