import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import request from 'supertest';
import { createApp } from '../src/app.js';

export async function setup() {
  const db = new PGlite();
  await db.exec(await readFile(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8'));
  const config = {
    jwtSecret: 'test-secret-only-never-use-in-production', jwtExpiresIn: '1h',
    clientOrigin: 'http://localhost:5173', timezone: 'Asia/Kolkata',
  };
  const api = request(createApp({ db, config }));
  async function register(email = 'patient@example.com') {
    const result = await api.post('/api/auth/register').send({ name: 'Demo Patient', email, password: 'TestPass123!' });
    if (result.status !== 201) throw new Error(JSON.stringify(result.body));
    return { ...result.body, authorization: `Bearer ${result.body.token}` };
  }
  return { db, api, config, register };
}
