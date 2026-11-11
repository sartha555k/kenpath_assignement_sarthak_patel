import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers.js';
import { seedDemo, DEMO_EMAIL, DEMO_PASSWORD } from '../seeds/demo.js';

test('demo seed is repeatable, creates useful reports and permits login', async () => {
  const { db, api } = await setup();
  try {
    const now = new Date('2024-10-15T12:00:00Z');
    await seedDemo(db, 'Asia/Kolkata', now);
    const before = (await db.query('SELECT count(*)::int AS count FROM readings')).rows[0].count;
    await seedDemo(db, 'Asia/Kolkata', now);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM users')).rows[0].count, 1);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM readings')).rows[0].count, before);
    assert.equal(before, 40);
    const login = await api.post('/api/auth/login').send({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    assert.equal(login.status, 200);
    const report = await api.get('/api/reports?date=2024-10-15').set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(report.body.reports.daily.count, 4);
    assert.equal(report.body.reports.monthToDate.count, 28);
    assert.equal(report.body.reports.monthly.count, 12);
  } finally { await db.close(); }
});
