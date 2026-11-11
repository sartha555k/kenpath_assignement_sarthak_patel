import { parseArgs } from 'node:util';
import { loadConfig } from '../src/config.js';
import { createDatabase } from '../src/db.js';
import { seedDemoRange } from '../seeds/demo-range.js';

const { values } = parseArgs({
  options: { from: { type: 'string' }, to: { type: 'string' }, 'allow-future': { type: 'boolean', default: false } },
});
if (!values.from || !values.to) {
  throw new Error('Usage: npm run db:seed:range -- --from YYYY-MM-DD --to YYYY-MM-DD [--allow-future]');
}
const config = loadConfig();
if (config.production) throw new Error('Demo seeding is disabled in production.');
const db = createDatabase(config.databaseUrl);
const client = await db.connect();
try {
  const result = await seedDemoRange(client, {
    from: values.from, to: values.to, allowFuture: values['allow-future'], timezone: config.timezone,
  });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await db.end();
}
