import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('behind one proxy auth limits stay per client and cannot be bypassed with a forged prefix', async () => {
  const api = request(createApp({ db: {}, config: { trustProxyHops: 1 } }));
  const attempt = (forwarded) => api.post('/api/auth/login')
    .set('X-Forwarded-For', forwarded).send({ email: 'invalid' });
  for (let i = 0; i < 30; i++) {
    assert.equal((await attempt('198.51.100.10')).status, 400);
  }
  assert.equal((await attempt('198.51.100.10')).status, 429);
  assert.equal((await attempt('203.0.113.50, 198.51.100.10')).status, 429);
  assert.equal((await attempt('198.51.100.11')).status, 400);
});

test('direct deployments ignore forwarded client addresses by default', async () => {
  const api = request(createApp({ db: {}, config: {} }));
  for (let i = 0; i < 30; i++) {
    const result = await api.post('/api/auth/login').send({ email: 'invalid' });
    assert.equal(result.status, 400);
  }
  const result = await api.post('/api/auth/login')
    .set('X-Forwarded-For', '198.51.100.11').send({ email: 'invalid' });
  assert.equal(result.status, 429);
});
