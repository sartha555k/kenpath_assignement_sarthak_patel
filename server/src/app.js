import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './errors.js';
import { authRouter } from './auth.js';
import { readingsRouter } from './readings.js';

export function createApp({ db, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '16kb' }));
  app.get('/api/health', async (req, res) => {
    try {
      await db.query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ error: { message: 'Database is unavailable.' } });
    }
  });
  app.use('/api/auth', authRouter(db, config));
  app.use('/api/readings', readingsRouter(db, config));
  app.use((req, res) => res.status(404).json({ error: { message: 'Route not found.' } }));
  app.use(errorHandler);
  return app;
}
