import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './helpers.js';

const reading = { date: '2024-02-29', slot: 'after_lunch', value: 120 };

test('reading CRUD, pagination and strict ownership', async () => {
  const { db, api, register } = await setup();
  try {
    const first = await register();
    const second = await register('second@example.com');
    const auth = first.authorization;
    assert.equal((await api.get('/api/readings')).status, 401);
    const created = await api.post('/api/readings').set('Authorization', auth).send({ ...reading, user_id: second.user.id });
    assert.equal(created.status, 201);
    assert.equal(created.body.reading.date, reading.date);
    const id = created.body.reading.id;
    const path = `/api/readings/${id}`;
    assert.equal((await api.get('/api/readings').set('Authorization', second.authorization)).body.pagination.total, 0);
    for (const method of ['get', 'put', 'delete']) {
      const result = await api[method](path).set('Authorization', second.authorization).send(reading);
      assert.equal(result.status, 404);
    }
    const edited = await api.put(path).set('Authorization', auth).send({ ...reading, value: 40 });
    assert.equal(edited.body.reading.value, 40);
    const list = await api.get('/api/readings?page=1&limit=1&date=2024-02-29').set('Authorization', auth);
    assert.equal(list.body.readings.length, 1);
    assert.equal(list.body.pagination.total, 1);
    const range = await api.get('/api/readings?from=2024-02-01&to=2024-02-29').set('Authorization', auth);
    assert.equal(range.body.pagination.total, 1);
    assert.equal((await api.get('/api/readings?from=2024-03-01&to=2024-03-02').set('Authorization', auth)).body.pagination.total, 0);
    assert.equal((await api.get('/api/readings?from=2024-03-01&to=2024-02-01').set('Authorization', auth)).status, 400);
    assert.equal((await api.get('/api/readings?from=2024-02-30').set('Authorization', auth)).status, 400);
    assert.equal((await api.get('/api/readings?page=0').set('Authorization', auth)).status, 400);
    assert.equal((await api.get('/api/readings?limit=101').set('Authorization', auth)).status, 400);
    assert.equal((await api.delete(path).set('Authorization', auth)).status, 204);
    assert.equal((await api.get(path).set('Authorization', auth)).status, 404);
  } finally { await db.close(); }
});

test('reading validation, duplicate slots, four-per-day cap and editing conflicts', async () => {
  const { db, api, register } = await setup();
  try {
    const { authorization } = await register();
    for (const invalid of [
      { value: undefined }, { value: null }, { value: '' }, { value: 39 }, { value: 601 },
      { value: 100.5 }, { value: '100' }, { slot: 'other' }, { slot: ['morning'] },
      { slot: { toString: 'morning' } }, { date: '2099-01-01' },
      { date: '2023-02-29' }, { date: '2024-04-31' }, { date: '01/01/2024' },
    ]) {
      const result = await api.post('/api/readings').set('Authorization', authorization).send({ ...reading, ...invalid });
      assert.equal(result.status, 400, JSON.stringify(invalid));
      assert.ok(result.body.error.message);
    }
    const created = await api.post('/api/readings').set('Authorization', authorization).send(reading);
    assert.equal(created.status, 201);
    const duplicate = await api.post('/api/readings').set('Authorization', authorization).send(reading);
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.body.error.message, /After lunch/);
    for (const slot of ['morning', 'after_breakfast', 'after_dinner']) {
      assert.equal((await api.post('/api/readings').set('Authorization', authorization).send({ ...reading, slot, value: 600 })).status, 201);
    }
    const fifth = await api.post('/api/readings').set('Authorization', authorization).send(reading);
    assert.equal(fifth.status, 409);
    assert.match(fifth.body.error.message, /only 4/);
    assert.equal((await api.put(`/api/readings/${created.body.reading.id}`).set('Authorization', authorization).send({ ...reading, value: 130 })).status, 200);
    const otherDate = await api.post('/api/readings').set('Authorization', authorization).send({ ...reading, date: '2024-02-28' });
    assert.equal((await api.put(`/api/readings/${otherDate.body.reading.id}`).set('Authorization', authorization).send(reading)).status, 409);
  } finally { await db.close(); }
});

test('concurrent duplicate writes yield one success and one conflict', async () => {
  const { db, api, register } = await setup();
  try {
    const { authorization } = await register();
    const results = await Promise.all([1, 2].map(() => api.post('/api/readings').set('Authorization', authorization).send(reading)));
    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM readings')).rows[0].count, 1);
  } finally { await db.close(); }
});
