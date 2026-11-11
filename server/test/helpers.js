import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

export async function setup() {
  const migration = await readFile(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8');
  let db;
  if (process.env.TEST_DATABASE_URL) {
    const client = new pg.Client({ connectionString: process.env.TEST_DATABASE_URL });
    await client.connect();
    const schema = `test_${randomUUID().replaceAll('-', '')}`;
    try {
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(`SET search_path TO ${schema}`);
      await client.query(migration);
    } catch (error) {
      await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await client.end();
      throw error;
    }
    db = {
      query: (...args) => client.query(...args),
      close: async () => {
        try { await client.query(`DROP SCHEMA ${schema} CASCADE`); }
        finally { await client.end(); }
      },
    };
  } else {
    db = new PGlite();
    await db.exec(migration);
  }
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
