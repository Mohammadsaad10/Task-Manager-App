import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { configureCloudinary } from './utils/cloudinary';
import { startHeartbeat, stopHeartbeat } from './services/sse.service';
import { errorHandler } from './middleware/errorHandler';
import prisma from './lib/prisma';

// Route imports
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import attachmentRoutes from './routes/attachment.routes';
import activityRoutes from './routes/activity.routes';
import sseRoutes from './routes/sse.routes';
import adminRoutes from './routes/admin.routes';

// Configure external services
configureCloudinary();

// Create Express app
const app = express();

// Trust reverse proxies (Render, AWS, etc.) — required for rate limiting behind proxies
app.set('trust proxy', 1);

// ---------------------
// Global Middleware
// ---------------------
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------
// Health Check
// ---------------------
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      db: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// ---------------------
// API Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:id/attachments', attachmentRoutes);
app.use('/api/tasks/:id/activity', activityRoutes);
app.use('/api/events', sseRoutes);
app.use('/api/admin', adminRoutes);

// ---------------------
// Global Error Handler (must be LAST)
// ---------------------
app.use(errorHandler);

const PORT = env.PORT;

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔑 Auth endpoints: http://localhost:${PORT}/api/auth`);
    console.log(`📝 Task endpoints: http://localhost:${PORT}/api/tasks`);
    console.log(`📡 SSE endpoint: http://localhost:${PORT}/api/events`);
    console.log(`⚡ Admin endpoints: http://localhost:${PORT}/api/admin\n`);

    // Start SSE heartbeat keepalive
    startHeartbeat();
  });

  // Graceful shutdown
  function gracefulShutdown(signal: string) {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    stopHeartbeat();
    server.close(async () => {
      await prisma.$disconnect();
      console.log('HTTP server closed.');
      process.exit(0);
    });
    // Force shutdown after 10s
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
