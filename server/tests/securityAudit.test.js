// server/tests/securityAudit.test.js
// Automated Security Audit Test Suite for ALLOY Super Admin & AlloyTrust
// Run via: node server/tests/securityAudit.test.js

import assert from 'assert';
import http from 'http';
import { calculateRiskScore, evaluateDeterministicRules, SIGNAL_CATALOG } from '../../src/services/alloyTrustEngine.js';

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

async function runSecurityTestSuite() {
  console.log('================================================================');
  console.log(' ALLOY — AUTOMATED SECURITY AUDIT TEST SUITE');
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

  // --- 1. UNAUTHENTICATED ACCESS CONTROLS ---
  console.log('--- Test Group 1: Privileged Endpoint Authorization ---');

  await test('Reject unauthenticated request to /api/admin/overview with 401', async () => {
    const res = await makeRequest('/api/admin/overview');
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
    assert.strictEqual(res.data.ok, false);
  });

  await test('Reject unauthenticated request to /api/admin/verify with 401', async () => {
    const res = await makeRequest('/api/admin/verify');
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  await test('Reject unauthenticated request to /api/admin/brands with 401', async () => {
    const res = await makeRequest('/api/admin/brands');
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  await test('Reject unauthenticated request to /api/admin/trust/reports with 401', async () => {
    const res = await makeRequest('/api/admin/trust/reports');
    assert.strictEqual(res.status, 401, `Expected 401, got ${res.status}`);
  });

  await test('Reject invalid/forged Bearer token with 401 or 503', async () => {
    const res = await makeRequest('/api/admin/verify', {
      headers: { 'Authorization': 'Bearer forged.token.signature' }
    });
    assert([401, 503].includes(res.status), `Expected 401 or 503 for forged token, got ${res.status}`);
  });

  // --- 2. AUDIT LOG IMMUTABILITY & METHOD RESTRICTION ---
  console.log('\n--- Test Group 2: Audit Trail Immutability & Method Controls ---');

  await test('Reject POST to /api/admin/audit with 405 Method Not Allowed', async () => {
    const res = await makeRequest('/api/admin/audit', { method: 'POST', body: { action: 'FORGED_LOG' } });
    assert.strictEqual(res.status, 405, `Expected 405, got ${res.status}`);
  });

  await test('Reject DELETE to /api/admin/audit with 405 Method Not Allowed', async () => {
    const res = await makeRequest('/api/admin/audit', { method: 'DELETE' });
    assert.strictEqual(res.status, 405, `Expected 405, got ${res.status}`);
  });

  // --- 3. PROVISIONING BOOTSTRAP SECURITY ---
  console.log('\n--- Test Group 3: Super Admin Provisioning Hardening ---');

  await test('Reject provisioning with wrong secret or unconfigured state with 403 or 503', async () => {
    const res = await makeRequest('/api/admin/provision', {
      method: 'POST',
      body: { secret: 'invalid-attempt', email: 'attacker@alloy.co' }
    });
    assert([400, 403, 503].includes(res.status), `Expected 400, 403 or 503, got ${res.status}`);
    assert.strictEqual(res.data.ok, false);
  });

  await test('Reject provisioning with missing payload fields with 400, 403 or 503', async () => {
    const res = await makeRequest('/api/admin/provision', {
      method: 'POST',
      body: {}
    });
    assert([400, 403, 503].includes(res.status), `Expected 400, 403 or 503, got ${res.status}`);
    assert.strictEqual(res.data.ok, false);
  });

  // --- 4. ALLOYTRUST FALSE POSITIVE & DEDUPLICATION AUDIT ---
  console.log('\n--- Test Group 4: AlloyTrust Risk Model & Signal Deduplication ---');

  await test('Deduplicate duplicate signal instances to prevent score inflation', () => {
    const duplicateSignals = [
      { signalId: 'SIG_INCOMPLETE_PROFILE', weight: 10, confidence: 0.8 },
      { signalId: 'SIG_INCOMPLETE_PROFILE', weight: 10, confidence: 0.8 },
      { signalId: 'SIG_INCOMPLETE_PROFILE', weight: 10, confidence: 0.8 }
    ];
    const result = calculateRiskScore(duplicateSignals);
    // Should only count once: impact of ~8, score <= 10
    assert.strictEqual(result.breakdown.length, 1, `Expected 1 deduplicated signal, got ${result.breakdown.length}`);
    assert(result.score <= 15, `Expected score <= 15 for deduplicated profile signal, got ${result.score}`);
    assert.strictEqual(result.category, 'low');
  });

  await test('Apply category dampening across correlated signals', () => {
    const sameCategorySignals = [
      { signalId: 'SIG_NEW_ACCOUNT', weight: 10, confidence: 1.0 },       // category: account
      { signalId: 'SIG_INCOMPLETE_PROFILE', weight: 10, confidence: 1.0 }  // category: account
    ];
    const result = calculateRiskScore(sameCategorySignals);
    // 1st signal: 10 pts; 2nd signal (dampened 50%): 5 pts = 15 total
    assert.strictEqual(result.score, 15, `Expected dampened score 15, got ${result.score}`);
    assert.strictEqual(result.category, 'low');
  });

  await test('Informational signals alone cannot exceed Moderate threshold (Max 45)', () => {
    const informationalSignals = [
      { signalId: 'SIG_NEW_ACCOUNT', weight: 10, confidence: 1.0 },
      { signalId: 'SIG_INCOMPLETE_PROFILE', weight: 10, confidence: 1.0 },
      { signalId: 'SIG_BUDGET_ANOMALY', weight: 15, confidence: 1.0 },
      { signalId: 'SIG_DISPUTED_DELIVERABLE', weight: 15, confidence: 1.0 }
    ];
    const result = calculateRiskScore(informationalSignals);
    // Non-severe signals must NEVER cross into High (60+) or Critical (85+)
    assert(result.score <= 45, `Expected score <= 45, got ${result.score}`);
    assert(['low', 'moderate'].includes(result.category), `Expected low or moderate, got ${result.category}`);
    assert.strictEqual(result.requiresHumanAuthorization, true);
    assert.strictEqual(result.isAdvisoryOnly, true);
  });

  await test('Critical score requires severe compliance or security signals', () => {
    const severeSignals = [
      { signalId: 'SIG_IDENTITY_MISMATCH', weight: 45, confidence: 1.0 },
      { signalId: 'SIG_OFF_PLATFORM_TERMS', weight: 35, confidence: 1.0 },
      { signalId: 'SIG_SUSPICIOUS_LINKS', weight: 35, confidence: 1.0 }
    ];
    const result = calculateRiskScore(severeSignals);
    assert(result.score >= 85, `Expected score >= 85 for severe fraud combination, got ${result.score}`);
    assert.strictEqual(result.category, 'critical');
    assert.strictEqual(result.hasSevereSignals, true);
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch(err => {
  console.error('Test execution failure:', err);
  process.exit(1);
});
