import { Router } from 'express';
import { authenticate } from './auth.js';
import { today, validateDate } from './validation.js';

export function reportsRouter(db, config) {
  const router = Router();
  router.use(authenticate(config));
  router.get('/', async (req, res) => {
    const date = validateDate(req.query.date ?? today(config.timezone), config.timezone);
    // PostgreSQL date arithmetic handles leap years and December/January boundaries.
    // One statement gives all summaries and daily readings a consistent snapshot.
    const { rows } = await db.query(`
      WITH ranges AS (
        SELECT 'daily' AS type, $2::date AS start_date, $2::date AS end_date
        UNION ALL
        SELECT 'monthToDate', date_trunc('month', $2::date)::date, $2::date
        UNION ALL
        SELECT 'monthly', (date_trunc('month', $2::date) - interval '1 month')::date,
               (date_trunc('month', $2::date) - interval '1 day')::date
      )
      SELECT ranges.type, start_date::text AS "startDate", end_date::text AS "endDate",
             count(r.id)::int AS count, max(r.value) AS highest, min(r.value) AS lowest,
             round(avg(r.value), 1)::float AS average,
             coalesce(json_agg(json_build_object('id', r.id, 'date', r.date::text, 'slot', r.slot, 'value', r.value)
               ORDER BY CASE r.slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END)
               FILTER (WHERE r.id IS NOT NULL AND ranges.type = 'daily'), '[]'::json) AS readings
      FROM ranges
      LEFT JOIN readings r ON r.user_id = $1 AND r.date BETWEEN ranges.start_date AND ranges.end_date
      GROUP BY ranges.type, start_date, end_date`, [req.userId, date]);
    const reports = {};
    for (const { type, readings, ...summary } of rows) {
      reports[type] = {
        ...summary,
        ...(type === 'daily' && { readings }),
        ...(summary.count === 0 && { message: 'No readings yet for this period. Add a reading to get started.' }),
      };
    }
    res.json({ date, reports });
  });
  return router;
}
