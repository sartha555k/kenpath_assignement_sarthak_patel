import bcrypt from 'bcrypt';
import { today } from '../src/validation.js';

export const DEMO_EMAIL = 'demo@sweety.example';
export const DEMO_PASSWORD = 'SweetyDemo123!';

// Pass a single connected database client so the whole seed is transactional.
export async function seedDemo(db, timezone, now = new Date()) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  await db.query('BEGIN');
  try {
    await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['Demo Patient', DEMO_EMAIL, passwordHash],
    );
    const { rows } = await db.query('SELECT id FROM users WHERE email = $1', [DEMO_EMAIL]);
    const current = new Date(`${today(timezone, now)}T00:00:00Z`);
    const dates = [];
    for (let offset = 0; offset < 7; offset++) {
      const date = new Date(current);
      date.setUTCDate(date.getUTCDate() - offset);
      dates.push(date.toISOString().slice(0, 10));
    }
    const previous = new Date(current);
    previous.setUTCDate(0);
    for (let offset = 0; offset < 3; offset++) {
      const date = new Date(previous);
      date.setUTCDate(date.getUTCDate() - offset * 7);
      dates.push(date.toISOString().slice(0, 10));
    }
    const slots = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];
    for (const [dayIndex, date] of [...new Set(dates)].entries()) {
      for (const [slotIndex, slot] of slots.entries()) {
        await db.query(
          `INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, date, slot) DO NOTHING`,
          [rows[0].id, date, slot, 85 + slotIndex * 18 + (dayIndex % 5) * 7],
        );
      }
    }
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
