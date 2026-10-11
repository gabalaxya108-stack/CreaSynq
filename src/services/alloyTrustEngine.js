// src/services/alloyTrustEngine.js
// ALLOY — AlloyTrust Trust & Safety Intelligence Engine
// Multi-layered risk scoring, signal deduplication, false-positive mitigation,
// and human-in-the-loop decision governance.

/**
 * Risk Category Thresholds (0-100 scale)
 * Low: 0 - 29 (Standard monitoring, normal operation)
 * Moderate: 30 - 59 (Informational notice, routine review queue)
 * High: 60 - 84 (Priority investigation, hold high-value automated payouts)
 * Critical: 85 - 100 (Requires urgent Super Admin decision memo)
 * 
 * NOTE: Automated scoring is strictly ADVISORY.
 * ALL consequential restrictions (freezes, suspensions, rate limits)
 * require explicit, authorized human Super Admin review and approval.
 */
export const RISK_THRESHOLDS = {
  LOW_MAX: 29,
  MODERATE_MAX: 59,
  HIGH_MAX: 84,
  CRITICAL_MIN: 85
};

export function getRiskCategory(score) {
  if (score >= RISK_THRESHOLDS.CRITICAL_MIN) return 'critical';
  if (score > RISK_THRESHOLDS.MODERATE_MAX) return 'high';
  if (score > RISK_THRESHOLDS.LOW_MAX) return 'moderate';
  return 'low';
}

export function getRiskBadgeColor(category) {
  switch (category) {
    case 'critical': return { bg: 'rgba(220, 38, 38, 0.08)', text: '#b91c1c', border: 'rgba(220, 38, 38, 0.25)' };
    case 'high': return { bg: 'rgba(234, 88, 12, 0.08)', text: '#c2410c', border: 'rgba(234, 88, 12, 0.25)' };
    case 'moderate': return { bg: 'rgba(180, 133, 48, 0.12)', text: '#926114', border: 'rgba(180, 133, 48, 0.25)' };
    case 'low':
    default: return { bg: 'rgba(33, 76, 53, 0.08)', text: '#214C35', border: 'rgba(33, 76, 53, 0.2)' };
  }
}

/**
 * Predefined Signal Definitions & Calibrated Weights
 * Tuned to eliminate false positives:
 * Informational factors (new account, budget, revision dispute) have low weights.
 */
export const SIGNAL_CATALOG = [
  { id: 'SIG_NEW_ACCOUNT', name: 'Fresh Entity Account', category: 'account', defaultWeight: 10, severity: 'info' },
  { id: 'SIG_INCOMPLETE_PROFILE', name: 'Pending Profile Enrichment', category: 'account', defaultWeight: 10, severity: 'info' },
  { id: 'SIG_BUDGET_ANOMALY', name: 'High-Value Escrow Tier Notice', category: 'financial', defaultWeight: 15, severity: 'info' },
  { id: 'SIG_DISPUTED_DELIVERABLE', name: 'Creative Iteration Dispute', category: 'deliverable', defaultWeight: 15, severity: 'moderate' },
  { id: 'SIG_RAPID_INVITES', name: 'High Frequency Activity Spike', category: 'velocity', defaultWeight: 20, severity: 'moderate' },
  { id: 'SIG_OFF_PLATFORM_TERMS', name: 'Prohibited Off-Platform Payment Solicitation', category: 'compliance', defaultWeight: 35, severity: 'high' },
  { id: 'SIG_SUSPICIOUS_LINKS', name: 'External Unverified Redirect / Malicious URL', category: 'security', defaultWeight: 35, severity: 'high' },
  { id: 'SIG_IDENTITY_MISMATCH', name: 'Payout Identity vs Corporate Entity Discrepancy', category: 'identity', defaultWeight: 45, severity: 'critical' }
];

/**
 * Computes a calibrated risk score with:
 * 1. Signal deduplication (identical signal IDs merged to highest confidence instance)
 * 2. Category dampening (diminishing returns for multiple signals in same category)
 * 3. Informational cap (non-severe signals alone cannot exceed Moderate threshold)
 */
export function calculateRiskScore(triggeredSignals = [], baseScore = 0) {
  if (!triggeredSignals || triggeredSignals.length === 0) {
    return {
      score: Math.min(100, Math.max(0, baseScore)),
      category: getRiskCategory(baseScore),
      breakdown: []
    };
  }

  // 1. Deduplicate by signalId, keeping the highest impact entry
  const deduplicatedMap = new Map();
  triggeredSignals.forEach(item => {
    const catalogItem = SIGNAL_CATALOG.find(s => s.id === item.signalId);
    const weight = item.weight ?? (catalogItem ? catalogItem.defaultWeight : 10);
    const confidence = Math.min(1.0, Math.max(0.1, item.confidence ?? 1.0));
    const impact = Math.round(weight * confidence);

    const existing = deduplicatedMap.get(item.signalId);
    if (!existing || impact > existing.impact) {
      deduplicatedMap.set(item.signalId, {
        signalId: item.signalId,
        name: catalogItem?.name || item.signalId,
        category: catalogItem?.category || 'general',
        severity: catalogItem?.severity || 'info',
        weight,
        confidence,
        impact,
        details: item.details || catalogItem?.name
      });
    }
  });

  const uniqueSignals = Array.from(deduplicatedMap.values());

  // 2. Apply Category Dampening
  // 1st signal in category: 100% weight, 2nd: 50%, 3rd+: 25%
  const categoryCounts = {};
  let totalCalculatedContribution = 0;
  const breakdown = [];

  uniqueSignals.forEach(sig => {
    const count = categoryCounts[sig.category] || 0;
    categoryCounts[sig.category] = count + 1;

    let dampeningFactor = 1.0;
    if (count === 1) dampeningFactor = 0.5;
    else if (count >= 2) dampeningFactor = 0.25;

    const finalContribution = Math.round(sig.impact * dampeningFactor);
    totalCalculatedContribution += finalContribution;

    breakdown.push({
      ...sig,
      dampenedImpact: finalContribution
    });
  });

  // 3. Informational Cap: Check if any high/critical security signals exist
  const hasHighOrCriticalSignal = uniqueSignals.some(
    s => s.severity === 'high' || s.severity === 'critical'
  );

  let compositeScore = baseScore + totalCalculatedContribution;

  // If ONLY informational/low signals are present (e.g., new account, budget, bio, normal dispute),
  // CAP composite score at 45 (Moderate max) to strictly prevent false positive account freezes!
  if (!hasHighOrCriticalSignal) {
    compositeScore = Math.min(45, compositeScore);
  }

  compositeScore = Math.min(100, Math.max(0, Math.round(compositeScore)));
  const category = getRiskCategory(compositeScore);

  return {
    score: compositeScore,
    category,
    breakdown,
    hasSevereSignals: hasHighOrCriticalSignal,
    isAdvisoryOnly: true,
    requiresHumanAuthorization: true
  };
}

/**
 * Evaluates an entity (Brand, Creator, Campaign, or Collaboration)
 * using deterministic heuristics.
 */
export function evaluateDeterministicRules(entityType, entityData) {
  const triggered = [];
  if (!entityData) return triggered;

  if (entityType === 'brand') {
    // Check if brand was recently created
    const createdTime = entityData.created_at ? new Date(entityData.created_at).getTime() : Date.now();
    const isUnder24Hours = (Date.now() - createdTime) < 24 * 60 * 60 * 1000;
    if (isUnder24Hours) {
      triggered.push({
        signalId: 'SIG_NEW_ACCOUNT',
        details: 'Brand account registered within the last 24 hours (observation window)',
        confidence: 0.8
      });
    }

    // Missing corporate website or location (informational profile completion)
    if (!entityData.website && !entityData.location) {
      triggered.push({
        signalId: 'SIG_INCOMPLETE_PROFILE',
        details: 'Brand profile is awaiting corporate website or office location verification',
        confidence: 0.7
      });
    }
  }

  if (entityType === 'creator') {
    const portfolioCount = Array.isArray(entityData.projects) ? entityData.projects.length : (entityData.portfolioCount || 0);
    // Profile enrichment notice (only triggers once)
    if (portfolioCount === 0 || (!entityData.bio || entityData.bio.length < 20)) {
      triggered.push({
        signalId: 'SIG_INCOMPLETE_PROFILE',
        details: 'Creator profile is in onboarding state (zero portfolio items or brief bio)',
        confidence: 0.65
      });
    }
  }

  if (entityType === 'campaign') {
    // High-value campaign allocation notice (advisory for escrow milestone verification)
    const budgetNum = parseInt(String(entityData.budget || '0').replace(/[^0-9]/g, ''), 10);
    if (budgetNum > 100000) {
      triggered.push({
        signalId: 'SIG_BUDGET_ANOMALY',
        details: `Tier 1 budget allocation (₹${budgetNum.toLocaleString()}) queued for standard escrow verification`,
        confidence: 0.7
      });
    }

    // Check brief text for explicit off-platform payment circumvention terms
    const briefText = `${entityData.title || ''} ${entityData.description || ''} ${entityData.deliverables || ''}`.toLowerCase();
    const prohibitedTerms = ['pay outside alloy', 'bypass escrow', 'wire directly to avoid fee', 'send crypto to bypass'];
    const matchedTerm = prohibitedTerms.find(t => briefText.includes(t));
    if (matchedTerm) {
      triggered.push({
        signalId: 'SIG_OFF_PLATFORM_TERMS',
        details: `Campaign brief contains terms indicating platform fee circumvention: "${matchedTerm}"`,
        confidence: 0.95
      });
    }
  }

  if (entityType === 'collaboration') {
    // Normal revision cycles are commercial iterations; only flag if excessive dispute
    if (entityData.revisionsCount > 3) {
      triggered.push({
        signalId: 'SIG_DISPUTED_DELIVERABLE',
        details: `Active contract has undergone ${entityData.revisionsCount} revision requests`,
        confidence: 0.75
      });
    }
  }

  return triggered;
}

/**
 * Automated Safety Analysis Synthesis
 * All outputs are marked isAdvisoryOnly: true to prevent unapproved automated freezes.
 */
export async function runAlloyTrustAnalysis({
  entityType,
  entityId,
  entityName,
  contentPayload,
  additionalContext = {}
}) {
  // 1. Run calibrated deterministic checks
  const deterministicSignals = evaluateDeterministicRules(entityType, {
    id: entityId,
    name: entityName,
    ...contentPayload
  });

  // 2. Perform semantic context scan
  const textToScan = JSON.stringify(contentPayload || {});
  const severeSecurityTerms = ['malicious proxy', 'stolen credentials', 'phishing redirect', 'bypass escrow fee'];
  const matchedSecurityTerms = severeSecurityTerms.filter(k => textToScan.toLowerCase().includes(k));

  if (matchedSecurityTerms.length > 0) {
    deterministicSignals.push({
      signalId: 'SIG_SUSPICIOUS_LINKS',
      details: `High-severity security pattern detected: ${matchedSecurityTerms.join(', ')}`,
      confidence: 0.9
    });
  }

  // 3. Compute deduplicated, dampened score
  const { score, category, breakdown, hasSevereSignals } = calculateRiskScore(deterministicSignals);

  // 4. Synthesize advisory recommendation (NEVER automated freeze without human review)
  let recommendedAction = 'APPROVE';
  let reasoning = 'Entity demonstrates normal marketplace behavior with no verified risk anomalies.';

  if (category === 'critical') {
    recommendedAction = 'MANUAL_SUPER_ADMIN_REVIEW_REQUIRED';
    reasoning = `Priority incident report generated (${breakdown.map(b => b.name).join(', ')}). Requires explicit Super Admin review and authorization before any account status modification.`;
  } else if (category === 'high') {
    recommendedAction = 'INVESTIGATE_AND_VERIFY';
    reasoning = `High risk score observed. Escrow milestone audit recommended before large fund releases.`;
  } else if (category === 'moderate') {
    recommendedAction = 'MONITOR_ACTIVITY';
    reasoning = `Minor velocity or profile observations noted. Standard operations continue normally.`;
  }

  return {
    reportId: `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    entityType,
    entityId,
    entityName,
    riskScore: score,
    riskCategory: category,
    recommendedAction,
    summary: reasoning,
    signalsTriggered: breakdown,
    isAdvisoryOnly: true,
    requiresHumanAuthorization: true,
    timestamp: new Date().toISOString()
  };
}
