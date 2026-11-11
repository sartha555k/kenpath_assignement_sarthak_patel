import bcrypt from 'bcrypt';
import { DEMO_EMAIL, DEMO_PASSWORD } from './demo.js';
import { SLOTS, today } from '../src/validation.js';

function calendarDate(value, name) {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name} must be a calendar date in YYYY-MM-DD format.`);
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`${name} must be a valid calendar date.`);
  }
  return date;
}

// Use a single connected client. This explicit fixture utility does not change
// API validation; future fixtures require a deliberate allowFuture option.
export async function seedDemoRange(db, { from, to, timezone = 'Asia/Kolkata', allowFuture = false, now = new Date() }) {
  const start = calendarDate(from, 'from');
  const end = calendarDate(to, 'to');
  const days = (end - start) / 86_400_000 + 1;
  if (days < 1) throw new Error('from must be on or before to.');
  if (days > 366) throw new Error('Seed at most 366 days in one operation.');
  if (!allowFuture && to > today(timezone, now)) {
    throw new Error('Future demo dates require the explicit --allow-future option.');
  }

  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  let inserted = 0;
  await db.query('BEGIN');
  try {
    await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['Demo Patient', DEMO_EMAIL, hash],
    );
    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
    const userId = rows[0].id;
    const slots = Object.keys(SLOTS);
    for (let day = 0; day < days; day++) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + day);
      for (const [index, slot] of slots.entries()) {
        // Deterministic synthetic values; no medical target or status is implied.
        const value = 87 + ((day * 11 + index * 19) % 74) + index * 4;
        const result = await db.query(
          `INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, date, slot) DO NOTHING RETURNING id`,
          [userId, date.toISOString().slice(0, 10), slot, value],
        );
        inserted += result.rows.length;
      }
    }
    await db.query('COMMIT');
    return { email: DEMO_EMAIL, from, to, days, inserted, preserved: days * 4 - inserted };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
