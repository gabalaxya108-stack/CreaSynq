// server/tests/full_integration_test.mjs
// End-to-End Live Integration Test for ALLOY Super Admin & AlloyTrust

import assert from 'assert';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = '.env';
const content = fs.readFileSync(envPath, 'utf8');
const env = {};
content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const judgeEmail = env.VITE_JUDGE_EMAIL || 'judge@alloy.market';
const judgePassword = env.VITE_JUDGE_PASSWORD || 'JudgeAlloy2026!';
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

function makeRequest(path, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, data: json, raw: data });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveE2ETest() {
  console.log('================================================================');
  console.log(' ALLOY — LIVE END-TO-END SUPABASE INTEGRATION TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${err.message}`);
      failed++;
    }
  }

  const client = createClient(supabaseUrl, supabaseAnonKey);
  let judgeToken = null;
  let judgeUser = null;

  await test('1. Authenticate judge account with real Supabase Auth', async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: judgeEmail,
      password: judgePassword
    });
    assert.strictEqual(error, null, error?.message);
    assert.ok(data.session?.access_token, 'Missing access token');
    assert.strictEqual(data.user?.email, judgeEmail);
    judgeToken = data.session.access_token;
    judgeUser = data.user;
  });

  await test('2. Reject unauthenticated request to /api/admin/verify with 401', async () => {
    const res = await makeRequest('/api/admin/verify');
    assert.strictEqual(res.status, 401);
  });

  await test('3. Reject forged token request to /api/admin/verify with 401', async () => {
    const res = await makeRequest('/api/admin/verify', {
      headers: { 'Authorization': 'Bearer forged.invalid.token' }
    });
    assert.strictEqual(res.status, 401);
  });

  await test('4. Verify judge session on /api/admin/verify with real Supabase token', async () => {
    const res = await makeRequest('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status} (${JSON.stringify(res.data)})`);
    assert.strictEqual(res.data.ok, true);
    assert.strictEqual(res.data.user.email, judgeEmail);
    assert(['judge_admin', 'super_admin'].includes(res.data.user.role), `Unexpected role: ${res.data.user.role}`);
  });

  await test('5. Fetch live overview metrics from /api/admin/overview', async () => {
    const res = await makeRequest('/api/admin/overview', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(typeof res.data.metrics.totalBrands === 'number');
    assert.ok(typeof res.data.metrics.totalCreators === 'number');
  });

  await test('6. Fetch brands registry from /api/admin/brands', async () => {
    const res = await makeRequest('/api/admin/brands', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(Array.isArray(res.data.brands));
  });

  await test('7. Fetch creator network from /api/admin/creators', async () => {
    const res = await makeRequest('/api/admin/creators', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(Array.isArray(res.data.creators));
  });

  await test('8. Fetch campaign briefs from /api/admin/campaigns', async () => {
    const res = await makeRequest('/api/admin/campaigns', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(Array.isArray(res.data.campaigns));
  });

  await test('9. Fetch trust reports from /api/admin/trust/reports', async () => {
    const res = await makeRequest('/api/admin/trust/reports', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(Array.isArray(res.data.reports));
  });

  await test('10. Fetch platform configuration from /api/admin/config', async () => {
    const res = await makeRequest('/api/admin/config', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
  });

  await test('11. Fetch audit events from /api/admin/audit', async () => {
    const res = await makeRequest('/api/admin/audit', {
      headers: { 'Authorization': `Bearer ${judgeToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.ok, true);
    assert.ok(Array.isArray(res.data.events));
  });

  await test('12. Reject invalid judge credentials cleanly via Supabase Auth', async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email: judgeEmail,
      password: 'WrongPassword123!'
    });
    assert.ok(error !== null, 'Expected login error for wrong password');
    assert.strictEqual(data?.session, null);
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runLiveE2ETest().catch(err => {
  console.error('Integration test failure:', err);
  process.exit(1);
});
