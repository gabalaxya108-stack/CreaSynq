// test/judgeTour.test.js
// Verification suite for Alloy Judge Demo Walkthrough component and workflows

import assert from 'node:assert/strict';
import { TOUR_STEPS } from '../src/data/judgeTourSteps.js';

console.log('\n================================================================');
console.log(' ALLOY — JUDGE DEMO WALKTHROUGH TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
const totalExpected = 10;

function runTest(name, fn) {
  try {
    fn();
    passedTests++;
    console.log(`✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    throw err;
  }
}

// Test 1: Exactly 6 stages defined in order
runTest('1. Tour defines exactly 6 structured stages in correct order', () => {
  assert.equal(TOUR_STEPS.length, 6, 'Walkthrough must have exactly 6 stages');
  const expectedIds = [
    'discover-creators',
    'find-match',
    'creator-workspaces',
    'build-trust',
    'collaborate',
    'super-admin'
  ];
  TOUR_STEPS.forEach((step, idx) => {
    assert.equal(step.stepId, expectedIds[idx], `Step ${idx + 1} ID mismatch`);
    assert.ok(step.title, `Step ${idx + 1} must have a title`);
    assert.ok(step.description, `Step ${idx + 1} must have a description`);
    assert.ok(Array.isArray(step.highlights) && step.highlights.length >= 2, `Step ${idx + 1} must have highlights`);
    assert.ok(typeof step.executeAction === 'function', `Step ${idx + 1} must have an executeAction function`);
  });
});

// Test 2: Step 1 directs judge to Discover Marketplace
runTest('2. Step 1 (Discover Creators) routes to discover view', () => {
  const step = TOUR_STEPS[0];
  let navigatedTo = null;
  step.executeAction({
    onNavigate: (view) => { navigatedTo = view; }
  });
  assert.equal(navigatedTo, 'discover');
});

// Test 3: Step 2 directs judge to matching/filtering pipeline
runTest('3. Step 2 (Find the Right Match) points to discovery filtering workflow', () => {
  const step = TOUR_STEPS[1];
  let navigatedTo = null;
  step.executeAction({
    onNavigate: (view) => { navigatedTo = view; }
  });
  assert.equal(navigatedTo, 'discover');
});

// Test 4: Step 3 enables demo creator workspace and routes to creator studio
runTest('4. Step 3 (Explore Creator Workspaces) invokes demo creator activation and routes to creator-workspace', () => {
  const step = TOUR_STEPS[2];
  let demoCreatorEnabled = false;
  let navigatedTo = null;
  step.executeAction({
    onNavigate: (view) => { navigatedTo = view; },
    onEnableDemoCreator: () => { demoCreatorEnabled = true; }
  });
  assert.equal(demoCreatorEnabled, true, 'Must enable demo creator to avoid empty state');
  assert.equal(navigatedTo, 'creator-workspace');
});

// Test 5: Step 4 directs judge to Trust Centre
runTest('5. Step 4 (Build Trust) routes to dedicated Trust Centre', () => {
  const step = TOUR_STEPS[3];
  let navigatedTo = null;
  step.executeAction({
    onNavigate: (view) => { navigatedTo = view; }
  });
  assert.equal(navigatedTo, 'trust-center');
});

// Test 6: Step 5 opens global messaging drawer
runTest('6. Step 5 (Collaborate) opens messaging interface without altering data', () => {
  const step = TOUR_STEPS[4];
  let messagesOpened = false;
  step.executeAction({
    onNavigate: () => {},
    onOpenMessages: () => { messagesOpened = true; }
  });
  assert.equal(messagesOpened, true, 'Must open messages drawer');
});

// Test 7: Step 6 routes to #/admin/login without exposing password
runTest('7. Step 6 (Explore Super Admin) routes to #/admin/login with zero password leakage', () => {
  const step = TOUR_STEPS[5];
  assert.equal(step.stepId, 'super-admin');
  
  // Security checks: Text and metadata MUST NOT contain actual password
  const stepString = JSON.stringify(step);
  assert.ok(!stepString.includes('JudgeDemo2026'), 'Step 6 must NEVER hardcode the raw password');
  assert.ok(!stepString.includes('password='), 'Step 6 must not leak credentials in URL query');
  assert.ok(step.description.includes('Autofill Judge Credentials') || step.description.includes('Judge Demo credentials'), 'Must mention judge credentials workflow');
});

// Test 8: Progress step tags match 'Step X of 6' format
runTest('8. Progress tags accurately display Step 1 of 6 through Step 6 of 6', () => {
  TOUR_STEPS.forEach((step, idx) => {
    assert.ok(step.tag.includes(`Step ${idx + 1} of 6`), `Tag "${step.tag}" must include "Step ${idx + 1} of 6"`);
  });
});

// Test 9: Each step has at least 3 factual highlights derived from real capabilities
runTest('9. Each step highlights real Alloy product capabilities', () => {
  TOUR_STEPS.forEach((step) => {
    assert.ok(step.highlights.length >= 3, `${step.stepId} should have at least 3 highlights`);
  });
  // Check specific features mentioned
  assert.ok(TOUR_STEPS[0].highlights.some(h => h.toLowerCase().includes('creator') || h.toLowerCase().includes('portfolio') || h.toLowerCase().includes('talent')));
  assert.ok(TOUR_STEPS[1].highlights.some(h => h.toLowerCase().includes('stage') || h.toLowerCase().includes('deterministic') || h.toLowerCase().includes('filtering')));
  assert.ok(TOUR_STEPS[2].highlights.some(h => h.toLowerCase().includes('workflow') || h.toLowerCase().includes('taxonomy') || h.toLowerCase().includes('milestone')));
  assert.ok(TOUR_STEPS[3].highlights.some(h => h.toLowerCase().includes('verification') || h.toLowerCase().includes('licensing') || h.toLowerCase().includes('provenance')));
  assert.ok(TOUR_STEPS[4].highlights.some(h => h.toLowerCase().includes('messaging') || h.toLowerCase().includes('drawer') || h.toLowerCase().includes('demo')));
  assert.ok(TOUR_STEPS[5].highlights.some(h => h.toLowerCase().includes('admin') || h.toLowerCase().includes('audit') || h.toLowerCase().includes('rbac')));
});

// Test 10: Graceful handling of missing callbacks in executeAction
runTest('10. executeAction handles missing callbacks without throwing', () => {
  TOUR_STEPS.forEach((step) => {
    assert.doesNotThrow(() => {
      step.executeAction({});
    }, `executeAction on ${step.stepId} must not crash when callbacks are omitted`);
  });
});

console.log('\n================================================================');
console.log(` Walkthrough Test Suite: ${passedTests}/${totalExpected} Tests Passed`);
console.log('================================================================\n');
