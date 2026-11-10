import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Server
  const server = app.listen(ENV.PORT, () => {
    console.log(`🚀 FITSync server running in [${ENV.NODE_ENV}] mode on http://localhost:${ENV.PORT}`);
    console.log(`📡 Health check available at: http://localhost:${ENV.PORT}/api/health`);
  });

  // Graceful shutdown
  const handleExit = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('💤 FITSync server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleExit('SIGINT'));
  process.on('SIGTERM', () => handleExit('SIGTERM'));
};

startServer();
