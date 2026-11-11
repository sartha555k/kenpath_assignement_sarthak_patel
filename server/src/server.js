import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabase } from './db.js';

const config = loadConfig();
const db = createDatabase(config.runtimeDatabaseUrl);
await db.query('SELECT 1');
const server = createApp({ db, config }).listen(config.port, '0.0.0.0', () => {
  console.log(`Sweety API listening on http://localhost:${config.port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    const timeout = setTimeout(() => process.exit(1), 10_000).unref();
    server.close(async () => {
      await db.end();
      clearTimeout(timeout);
      process.exit(0);
    });
  });
}
