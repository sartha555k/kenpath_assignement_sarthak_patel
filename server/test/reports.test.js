import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers.js';
import { today } from '../src/validation.js';

test('reports calculate separate ranges, round averages, order slots and isolate users', async () => {
  const { db, api, register } = await setup();
  try {
    const first = await register();
    const second = await register('other@example.com');
    for (const [date, slot, value] of [
      ['2024-08-31', 'morning', 600], ['2024-09-01', 'morning', 80],
      ['2024-09-30', 'morning', 100], ['2024-10-01', 'morning', 90],
      ['2024-10-15', 'after_dinner', 141], ['2024-10-15', 'morning', 100],
      ['2024-10-15', 'after_lunch', 120], ['2024-10-16', 'morning', 600],
    ]) await db.query('INSERT INTO readings (user_id, date, slot, value) VALUES ($1, $2, $3, $4)', [first.user.id, date, slot, value]);
    await db.query("INSERT INTO readings (user_id, date, slot, value) VALUES ($1, '2024-10-15', 'morning', 600)", [second.user.id]);
    assert.equal((await api.get('/api/reports?date=2024-10-15')).status, 401);
    const result = await api.get('/api/reports?date=2024-10-15').set('Authorization', first.authorization);
    assert.equal(result.status, 200);
    const { daily, monthToDate, monthly } = result.body.reports;
    assert.deepEqual([daily.count, daily.highest, daily.lowest, daily.average], [3, 141, 100, 120.3]);
    assert.deepEqual(daily.readings.map((item) => item.slot), ['morning', 'after_lunch', 'after_dinner']);
    assert.deepEqual([monthToDate.startDate, monthToDate.endDate, monthToDate.count, monthToDate.average], ['2024-10-01', '2024-10-15', 4, 112.8]);
    assert.deepEqual([monthly.startDate, monthly.endDate, monthly.count, monthly.average], ['2024-09-01', '2024-09-30', 2, 90]);
  } finally { await db.close(); }
});

test('reports handle empty data, leap years, year transitions and invalid dates', async () => {
  const { db, api, register } = await setup();
  try {
    const { authorization } = await register();
    for (const [date, start, end] of [
      ['2024-03-15', '2024-02-01', '2024-02-29'],
      ['2025-03-01', '2025-02-01', '2025-02-28'],
      ['2025-01-01', '2024-12-01', '2024-12-31'],
    ]) {
      const response = await api.get(`/api/reports?date=${date}`).set('Authorization', authorization);
      const { daily, monthly } = response.body.reports;
      assert.deepEqual([monthly.startDate, monthly.endDate], [start, end]);
      assert.deepEqual([daily.count, daily.average, daily.highest, daily.lowest, daily.readings], [0, null, null, null, []]);
      assert.ok(daily.message);
    }
    assert.equal((await api.get('/api/reports?date=2099-01-01').set('Authorization', authorization)).status, 400);
    assert.equal((await api.get('/api/reports?date=2023-02-29').set('Authorization', authorization)).status, 400);
    assert.equal((await api.get('/api/reports').set('Authorization', authorization)).body.date, today('Asia/Kolkata'));
    assert.equal(today('Asia/Kolkata', new Date('2024-01-01T20:00:00Z')), '2024-01-02');
    assert.equal(today('America/New_York', new Date('2024-01-01T02:00:00Z')), '2023-12-31');
  } finally { await db.close(); }
});
