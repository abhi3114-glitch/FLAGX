import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import flagRoutes from './routes/flag.routes.js';
import segmentRoutes from './routes/segment.routes.js';
import auditRoutes from './routes/audit.routes.js';
import evaluationRoutes from './routes/evaluation.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { initDatabase } from './config/database.js';
import { initRedis } from './config/redis.js';
import { startGrpcServer } from './grpc/server.js';
import { setupWebSocket } from './services/websocket.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/flags', flagRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/evaluate', evaluationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    console.log('✅ Database connected');

    // Initialize Redis
    await initRedis();
    console.log('✅ Redis connected');

    // Create HTTP server
    const server = createServer(app);

    // Setup WebSocket
    const wss = new WebSocketServer({ server, path: '/ws' });
    setupWebSocket(wss);
    console.log('✅ WebSocket server initialized');

    // Start gRPC server
    startGrpcServer();
    console.log('✅ gRPC server started on port 50051');

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();