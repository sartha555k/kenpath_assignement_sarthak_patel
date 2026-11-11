import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers.js';
import { seedDemoRange } from '../seeds/demo-range.js';

const range = { from: '2026-11-12', to: '2026-12-01', now: new Date('2026-11-12T12:00:00Z') };

test('explicit future fixtures fill 20 complete days without overwriting existing readings or other users', async () => {
  const { db, register, api } = await setup();
  try {
    const demo = await register('demo@sweety.example');
    const other = await register('other@example.com');
    await db.query("INSERT INTO readings (user_id,date,slot,value) VALUES ($1,'2026-11-12','morning',222)", [demo.user.id]);
    await db.query("INSERT INTO readings (user_id,date,slot,value) VALUES ($1,'2026-11-12','morning',333)", [other.user.id]);
    const result = await seedDemoRange(db, { ...range, allowFuture: true });
    assert.deepEqual([result.days, result.inserted, result.preserved], [20, 79, 1]);
    const days = await db.query('SELECT date::text AS date, count(*)::int AS count FROM readings WHERE user_id=$1 GROUP BY date ORDER BY date', [demo.user.id]);
    assert.equal(days.rows.length, 20);
    assert.equal(days.rows[0].date, range.from);
    assert.equal(days.rows.at(-1).date, range.to);
    assert.ok(days.rows.every(day => day.count === 4));
    assert.equal((await db.query("SELECT value FROM readings WHERE user_id=$1 AND date='2026-11-12' AND slot='morning'", [demo.user.id])).rows[0].value, 222);
    assert.equal((await db.query('SELECT value FROM readings WHERE user_id=$1', [other.user.id])).rows[0].value, 333);
    const repeated = await seedDemoRange(db, { ...range, allowFuture: true });
    assert.deepEqual([repeated.inserted, repeated.preserved], [0, 80]);
    // The fixture flag never bypasses normal HTTP validation.
    assert.equal((await api.post('/api/readings').set('Authorization', demo.authorization).send({ date: '2099-01-01', slot: 'morning', value: 100 })).status, 400);
  } finally { await db.close(); }
});

test('range validation rejects accidental future seeds, invalid dates and excessive spans before writing', async () => {
  const { db } = await setup();
  try {
    for (const invalid of [range, { ...range, from: '2026-11-31' }, { ...range, from: '2026-12-02' }, { ...range, from: '2024-01-01' }]) {
      await assert.rejects(seedDemoRange(db, invalid));
    }
    assert.equal((await db.query('SELECT count(*)::int AS count FROM users')).rows[0].count, 0);
  } finally { await db.close(); }
});
