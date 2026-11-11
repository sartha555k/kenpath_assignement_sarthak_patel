import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { AppError } from './errors.js';

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });

export function authenticate(config) {
  return (req, res, next) => {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) return next(new AppError(401, 'Please log in to continue.'));
    try {
      const payload = jwt.verify(header.slice(7), config.jwtSecret, {
        algorithms: ['HS256'], issuer: 'sweety-api', audience: 'sweety-client',
      });
      if (!/^\d+$/.test(payload.sub || '')) throw new Error('Invalid subject');
      req.userId = Number(payload.sub);
      next();
    } catch {
      next(new AppError(401, 'Your session is invalid or expired. Please log in again.'));
    }
  };
}

export function authRouter(db, config) {
  const router = Router();
  router.use(rateLimit({
    windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { error: { message: 'Too many authentication attempts. Please try again in 15 minutes.' } },
    skip: (req) => req.method === 'GET',
  }));

  function session(user) {
    return {
      user: publicUser(user),
      token: jwt.sign({}, config.jwtSecret, {
        subject: String(user.id), expiresIn: config.jwtExpiresIn, algorithm: 'HS256',
        issuer: 'sweety-api', audience: 'sweety-client',
      }),
    };
  }

  router.post('/register', async (req, res) => {
    const { name, password } = req.body || {};
    const email = validateEmail(req.body?.email);
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      throw new AppError(400, 'Name must contain between 1 and 100 characters.', 'name');
    }
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new AppError(400, 'Password must contain at least 8 characters and at most 72 UTF-8 bytes.', 'password');
    }
    const hash = await bcrypt.hash(password, 12);
    try {
      const { rows } = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name.trim(), email, hash],
      );
      res.status(201).json(session(rows[0]));
    } catch (error) {
      if (error.code === '23505') throw new AppError(409, 'An account with this email already exists.', 'email');
      throw error;
    }
  });

  router.post('/login', async (req, res) => {
    const email = validateEmail(req.body?.email);
    const password = req.body?.password;
    if (typeof password !== 'string' || !password || Buffer.byteLength(password, 'utf8') > 72) {
      throw new AppError(400, 'Please enter a valid password.', 'password');
    }
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    // Compare even for an unknown account to reduce account-dependent timing differences.
    const fallback = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
    const matches = await bcrypt.compare(password, rows[0]?.password_hash || fallback);
    if (!rows[0] || !matches) throw new AppError(401, 'Invalid email or password.');
    res.json(session(rows[0]));
  });

  router.get('/me', authenticate(config), async (req, res) => {
    const { rows } = await db.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
    if (!rows[0]) throw new AppError(401, 'Account no longer exists. Please log in again.');
    res.json({ user: publicUser(rows[0]) });
  });
  return router;
}

function validateEmail(value) {
  if (typeof value !== 'string' || value.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw new AppError(400, 'Please enter a valid email address.', 'email');
  }
  return value.trim().toLowerCase();
}
