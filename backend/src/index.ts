import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import winston from 'winston';
import { config, validateConfig } from './config/env';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';

validateConfig();

const app: Application = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'covid-slayer-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const whitelist = process.env.NODE_ENV === 'production'
  ? [config.FRONTEND_URL]
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/localhost:\d+$/,
      'http://localhost'
    ].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (whitelist.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      } else if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin} not in whitelist`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Covid Slayer Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.use((error: Error, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, {
        environment: config.NODE_ENV,
        port: config.PORT
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
