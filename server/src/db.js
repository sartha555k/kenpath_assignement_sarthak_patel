import pg from 'pg';

export function createDatabase(databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  pool.on('error', (error) => console.error('Unexpected database pool error:', error.message));
  return pool;
}
