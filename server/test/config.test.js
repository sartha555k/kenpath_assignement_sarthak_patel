import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

const base = { DATABASE_URL: 'postgresql://test:example@localhost/direct', JWT_SECRET: 'config-test-secret-only-not-for-production' };

test('API can use pooled connections while migrations and seeds keep the direct URL', () => {
  const config = loadConfig({ ...base, DATABASE_URL_POOLED: 'postgresql://test:example@localhost/pooled' });
  assert.equal(config.databaseUrl, base.DATABASE_URL);
  assert.equal(config.runtimeDatabaseUrl, 'postgresql://test:example@localhost/pooled');
});

test('local and Docker setups fall back to DATABASE_URL without a pooled setting', () => {
  const config = loadConfig(base);
  assert.equal(config.runtimeDatabaseUrl, base.DATABASE_URL);
  assert.equal(config.timezone, 'Asia/Kolkata');
  assert.equal(config.trustProxyHops, 0);
});

test('proxy hop count must be a bounded nonnegative whole number', () => {
  assert.equal(loadConfig({ ...base, TRUST_PROXY_HOPS: '1' }).trustProxyHops, 1);
  for (const value of ['-1', '1.5', 'true', '11']) {
    assert.throws(() => loadConfig({ ...base, TRUST_PROXY_HOPS: value }), /TRUST_PROXY_HOPS/);
  }
});
