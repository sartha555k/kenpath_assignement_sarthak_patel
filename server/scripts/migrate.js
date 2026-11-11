import { readdir, readFile } from 'node:fs/promises';
import { loadConfig } from '../src/config.js';
import { createDatabase } from '../src/db.js';

const db = createDatabase(loadConfig().databaseUrl);
const client = await db.connect();
try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(724019)');
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const directory = new URL('../migrations/', import.meta.url);
  for (const name of (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort()) {
    const existing = await client.query('SELECT name FROM schema_migrations WHERE name = $1', [name]);
    if (existing.rowCount) continue;
    await client.query(await readFile(new URL(name, directory), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    console.log(`Applied ${name}`);
  }
  await client.query('COMMIT');
  console.log('Database is up to date.');
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await db.end();
}
