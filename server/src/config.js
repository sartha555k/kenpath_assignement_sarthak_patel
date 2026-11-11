import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

export function loadConfig() {
  const { DATABASE_URL, JWT_SECRET } = process.env;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is required. See server/.env.example.');
  if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.startsWith('replace-this')) {
    throw new Error('JWT_SECRET must be a random secret of at least 32 characters.');
  }
  const timezone = process.env.APP_TIMEZONE || 'Asia/Kolkata';
  new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
  const port = Number(process.env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
  return {
    databaseUrl: DATABASE_URL,
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    timezone,
    port,
    production: process.env.NODE_ENV === 'production',
  };
}
