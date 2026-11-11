import { Router } from 'express';
import { authenticate } from './auth.js';
import { AppError } from './errors.js';
import { SLOTS, positiveInteger, validateDate, validateReading } from './validation.js';

const columns = 'id, date::text AS date, slot, value, created_at, updated_at';

export function readingsRouter(db, config) {
  const router = Router();
  router.use(authenticate(config));

  router.get('/', async (req, res) => {
    const page = positiveInteger(req.query.page ?? '1', 'page', 1000000);
    const limit = positiveInteger(req.query.limit ?? '20', 'limit', 100);
    const date = req.query.date === undefined ? null : validateDate(req.query.date, config.timezone);
    const from = req.query.from === undefined ? null : validateDate(req.query.from, config.timezone);
    const to = req.query.to === undefined ? null : validateDate(req.query.to, config.timezone);
    if (from && to && from > to) throw new AppError(400, 'Start date must be on or before end date.', 'from');
    const filters = 'user_id = $1 AND ($2::date IS NULL OR date = $2::date) AND ($3::date IS NULL OR date >= $3::date) AND ($4::date IS NULL OR date <= $4::date)';
    const { rows } = await db.query(
      `SELECT ${columns} FROM readings WHERE ${filters}
       ORDER BY date DESC, CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END
       LIMIT $5 OFFSET $6`, [req.userId, date, from, to, limit, (page - 1) * limit],
    );
    const count = await db.query(`SELECT count(*)::int AS total FROM readings WHERE ${filters}`, [req.userId, date, from, to]);
    const total = count.rows[0].total;
    res.json({ readings: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });

  async function conflict(error, userId, date, slot) {
    if (error.code !== '23505') throw error;
    const { rows } = await db.query('SELECT count(*)::int AS count FROM readings WHERE user_id = $1 AND date = $2', [userId, date]);
    if (rows[0].count >= 4) throw new AppError(409, 'You can add only 4 readings per day.', 'slot');
    const article = slot === 'morning' ? 'a' : 'an';
    throw new AppError(409, `You already have ${article} ${SLOTS[slot]} reading for this date.`, 'slot');
  }

  router.post('/', async (req, res) => {
    const { date, slot, value } = validateReading(req.body, config.timezone);
    try {
      const { rows } = await db.query(
        `INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4) RETURNING ${columns}`,
        [req.userId, date, slot, value],
      );
      res.status(201).json({ reading: rows[0] });
    } catch (error) { await conflict(error, req.userId, date, slot); }
  });

  router.get('/:id', async (req, res) => {
    const id = positiveInteger(req.params.id, 'id');
    const { rows } = await db.query(`SELECT ${columns} FROM readings WHERE id = $1 AND user_id = $2`, [id, req.userId]);
    if (!rows[0]) throw new AppError(404, 'Reading not found.');
    res.json({ reading: rows[0] });
  });

  // PUT replaces all three editable fields; ownership remains immutable.
  router.put('/:id', async (req, res) => {
    const id = positiveInteger(req.params.id, 'id');
    const { date, slot, value } = validateReading(req.body, config.timezone);
    try {
      const { rows } = await db.query(
        `UPDATE readings SET date = $1, slot = $2, value = $3, updated_at = now()
         WHERE id = $4 AND user_id = $5 RETURNING ${columns}`, [date, slot, value, id, req.userId],
      );
      if (!rows[0]) throw new AppError(404, 'Reading not found.');
      res.json({ reading: rows[0] });
    } catch (error) { await conflict(error, req.userId, date, slot); }
  });

  router.delete('/:id', async (req, res) => {
    const id = positiveInteger(req.params.id, 'id');
    const { rows } = await db.query('DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (!rows[0]) throw new AppError(404, 'Reading not found.');
    res.status(204).end();
  });
  return router;
}
