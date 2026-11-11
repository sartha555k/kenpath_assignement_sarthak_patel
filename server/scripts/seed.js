import { loadConfig } from '../src/config.js';
import { createDatabase } from '../src/db.js';
import { seedDemo, DEMO_EMAIL, DEMO_PASSWORD } from '../seeds/demo.js';

const config = loadConfig();
if (config.production) throw new Error('Demo seeding is disabled in production.');
const db = createDatabase(config.databaseUrl);
const client = await db.connect();
try {
  await seedDemo(client, config.timezone);
  console.log(`Demo ready. Email: ${DEMO_EMAIL} | Password: ${DEMO_PASSWORD}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await db.end();
}
