import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setup } from './helpers.js';

test('registration hashes passwords, normalizes emails and supports login', async () => {
  const { db, api, register } = await setup();
  try {
    const account = await register(' Patient@Example.com ');
    assert.equal(account.user.email, 'patient@example.com');
    assert.equal(account.user.password_hash, undefined);
    const { rows } = await db.query('SELECT password_hash FROM users');
    assert.notEqual(rows[0].password_hash, 'TestPass123!');
    assert.ok(await bcrypt.compare('TestPass123!', rows[0].password_hash));
    const login = await api.post('/api/auth/login').send({ email: 'PATIENT@example.com', password: 'TestPass123!' });
    assert.equal(login.status, 200);
    const me = await api.get('/api/auth/me').set('Authorization', account.authorization);
    assert.equal(me.body.user.id, account.user.id);
    assert.equal((await api.post('/api/auth/register').send({ name: 'Other', email: account.user.email, password: 'TestPass123!' })).status, 409);
  } finally { await db.close(); }
});

test('invalid credentials, missing tokens, expired tokens and invalid signup are rejected', async () => {
  const { db, api, config, register } = await setup();
  try {
    await register();
    assert.equal((await api.post('/api/auth/login').send({ email: 'patient@example.com', password: 'wrongpass' })).status, 401);
    assert.equal((await api.get('/api/auth/me')).status, 401);
    assert.equal((await api.get('/api/auth/me').set('Authorization', 'Bearer invalid')).status, 401);
    const token = jwt.sign({}, config.jwtSecret, { subject: '1', expiresIn: -1, issuer: 'sweety-api', audience: 'sweety-client' });
    assert.equal((await api.get('/api/auth/me').set('Authorization', `Bearer ${token}`)).status, 401);
    for (const body of [
      { name: '', email: 'new@example.com', password: 'TestPass123!' },
      { name: 'Name', email: 'invalid', password: 'TestPass123!' },
      { name: 'Name', email: 'new@example.com', password: 'short' },
      { name: 'Name', email: 'new@example.com', password: '😀'.repeat(19) },
    ]) assert.equal((await api.post('/api/auth/register').send(body)).status, 400);
  } finally { await db.close(); }
});
