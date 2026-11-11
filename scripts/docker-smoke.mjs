// Exercises the running Compose stack through Nginx, not directly against Express.
// CI uses a disposable project/database. No real account credentials are needed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const baseUrl = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8080';
const stateFile = process.env.SMOKE_STATE_FILE;
if (!stateFile) throw new Error('SMOKE_STATE_FILE must name a temporary test-state file.');

async function request(path, { token, body, status = 200, method = 'GET' } = {}) {
  const response = await fetch(`${baseUrl}/api${path}`, {
    method,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10_000),
  });
  const data = response.status === 204 ? null : await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}

if (process.argv[2] === 'persistence') {
  const { token, id, value } = JSON.parse(await readFile(stateFile, 'utf8'));
  const result = await request(`/readings/${id}`, { token });
  assert.equal(result.reading.value, value);
  console.log('Readings and authentication survived container recreation.');
  process.exit(0);
}

const home = await fetch(baseUrl, { signal: AbortSignal.timeout(10_000) });
assert.equal(home.status, 200);
const html = await home.text();
assert.match(html, /Sweety/);
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);
assert.ok(assets.some(asset => asset.endsWith('.js')), 'Production JS bundle is referenced.');
assert.ok(assets.some(asset => asset.endsWith('.css')), 'Production CSS bundle is referenced.');
for (const asset of assets) {
  const response = await fetch(`${baseUrl}${asset}`);
  assert.equal(response.status, 200, asset);
  assert.doesNotMatch(response.headers.get('content-type') || '', /text\/html/, 'Assets must not fall back to index.html.');
}
assert.equal((await fetch(`${baseUrl}/assets/missing-file.js`)).status, 404);
assert.match(await (await fetch(`${baseUrl}/journal`)).text(), /Sweety/);
assert.equal((await request('/health')).status, 'ok');
await request('/unknown-route', { status: 404 });
await request('/readings', { status: 401 });

const account = await request('/auth/register', {
  method: 'POST', status: 201,
  body: { name: 'Docker Smoke Patient', email: `docker-${randomUUID()}@sweety.example`, password: 'DockerSmoke123!' },
});
const token = account.token;
const date = '2024-10-15';
const morning = await request('/readings', { method: 'POST', status: 201, token, body: { date, slot: 'morning', value: 100 } });
const lunch = await request('/readings', { method: 'POST', status: 201, token, body: { date, slot: 'after_lunch', value: 141 } });
await request('/readings', { method: 'POST', status: 409, token, body: { date, slot: 'morning', value: 110 } });
await request('/readings', { method: 'POST', status: 400, token, body: { date, slot: 'after_dinner', value: 39 } });
await request('/readings', { method: 'POST', status: 400, token, body: { date: '2099-01-01', slot: 'after_dinner', value: 110 } });
const reports = await request(`/reports?date=${date}`, { token });
assert.equal(reports.reports.daily.count, 2);
assert.equal(reports.reports.daily.average, 120.5);
assert.equal(reports.reports.monthToDate.count, 2);
assert.equal(reports.reports.monthly.count, 0);
await request(`/readings/${lunch.reading.id}`, { method: 'PUT', token, body: { date, slot: 'after_lunch', value: 150 } });
assert.equal((await request(`/reports?date=${date}`, { token })).reports.daily.average, 125);
const grouped = await request('/readings?groupBy=date&limit=1', { token });
assert.equal(grouped.readings.length, 2);
assert.equal(grouped.pagination.total, 1);
const other = await request('/auth/register', {
  method: 'POST', status: 201,
  body: { name: 'Other Patient', email: `docker-${randomUUID()}@sweety.example`, password: 'DockerSmoke123!' },
});
await request(`/readings/${morning.reading.id}`, { token: other.token, status: 404 });
await request(`/readings/${lunch.reading.id}`, { method: 'DELETE', token, status: 204 });
const demo = await request('/auth/login', { method: 'POST', body: { email: 'demo@sweety.example', password: 'SweetyDemo123!' } });
assert.ok((await request('/readings', { token: demo.token })).pagination.total > 0);

// Token is test-only; never log or upload the temporary state file as an artifact.
await writeFile(stateFile, JSON.stringify({ token, id: morning.reading.id, value: 100 }), { mode: 0o600 });
console.log('Docker frontend assets, proxy, auth, CRUD, validation, reports, ownership and seed passed.');
