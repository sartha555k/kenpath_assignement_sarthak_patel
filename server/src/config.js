import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

export function loadConfig(env = process.env) {
  const { DATABASE_URL, JWT_SECRET } = env;
  if (!DATABASE_URL) throw new Error('DATABASE_URL is required. See server/.env.example.');
  if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET.startsWith('replace-this')) {
    throw new Error('JWT_SECRET must be a random secret of at least 32 characters.');
  }
  const timezone = env.APP_TIMEZONE || 'Asia/Kolkata';
  new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT.');
  const trustProxyHops = Number(env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 10) {
    throw new Error('TRUST_PROXY_HOPS must be a whole number between 0 and 10.');
  }
  return {
    databaseUrl: DATABASE_URL,
    runtimeDatabaseUrl: env.DATABASE_URL_POOLED || DATABASE_URL,
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '1d',
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
    timezone,
    port,
    trustProxyHops,
    production: env.NODE_ENV === 'production',
  };
}
